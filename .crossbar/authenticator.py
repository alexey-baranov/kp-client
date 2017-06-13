import os
from pprint import pprint

import six

from twisted.internet.defer import inlineCallbacks

from autobahn.twisted.wamp import ApplicationSession
from autobahn.wamp.exception import ApplicationError

from psycopg2cffi import compat, connect
compat.register()
import bcrypt
import os
import json
import sys
import requests


MAIN_FILENAME=   '../../kp-sequelizejs/cfg/main.json'
PRIVATE_FILENAME='../../kp-sequelizejs/cfg/private.json'

class AuthenticatorSession(ApplicationSession):
    def merge(self, a, b, path=None):
        if path is None: path = []
        for key in b:
            if key in a:
                if isinstance(a[key], dict) and isinstance(b[key], dict):
                    self.merge(a[key], b[key], path + [str(key)])
                elif a[key] == b[key]:
                    pass # same leaf value
                else:
                    a[key] = b[key]
            else:
                a[key] = b[key]
        return a

    @inlineCallbacks
    def onJoin(self, details):

        def authenticate(realm, authid, details):
            try:
                SEP = '...'
                captcha = ''
                captcha_url = 'https://www.google.com/recaptcha/api/siteverify'
                qs = {'secret': None, 'response':None}

                ticket = details['ticket']

                print("authenticating: realm='{}', authid='{}', ticket='{}'".format(realm, authid, ticket))

                db_conn = None
                conf_name = os.environ.get('NODE_ENV')
                if conf_name is None:
                    raise Exception('NODE_ENV not setted')
                if not os.path.exists(MAIN_FILENAME):
                    raise Exception('Config file not found')
                mainConf =    json.loads(open(MAIN_FILENAME, 'r').read()).get(conf_name)
                private = json.loads(open(PRIVATE_FILENAME, 'r').read()).get(conf_name)

                if mainConf is None and private is None:
                    raise Exception('Config section %s not found' % conf_name)

                if mainConf is None:
                    mainConf = {}
                if private is None:
                    private = {}

                config = self.merge(mainConf, private)
                pprint("merged config")
                pprint(config)

                if authid == config.get("server").get("username") and ticket == config.get("server").get("password"):
                    print('Authentication successfull')

                    return u'server'

                captcha= json.loads(ticket).get("captchaResponse")
                ticket= json.loads(ticket).get("password")


                pprint('ticket = %s' % ticket)
                pprint('captcha = %s' % captcha)


                qs = {'secret': config.get('captcha').get('secret'), 'response': captcha}

                #unittest2 captcha does not test to be able unit test
                if not (authid == config.get('unittest2').get('username') and captcha is None):
                    r = requests.post(captcha_url, data=qs)
                    if r.status_code == requests.codes.ok:
                        json_resp = json.loads(r.text)
                        if not json_resp.get('success', False):
                            raise ApplicationError("org.kopnik.invalid_captcha", ', '.join(json_resp.get('error-codes', [])))
                    else:
                        raise ApplicationError("org.kopnik.invalid_captcha_status_code", "invalid captcha response code = {}".format(r.status_code))
                        #print('status=%d' % r.status_code)


                db_conn = connect(
                    host=config.get('host'),
                    database=config.get('database'),
                    user=config.get('username'),
                    password=config.get('password')
                )

                cursor = db_conn.cursor()
                cursor.execute("SELECT k.password, k.rolee , k.id, k.email, k.name FROM public.\"Kopnik\" as k WHERE k.email= %s", [authid])

                rowcount = cursor.rowcount

                # no user in databese
                if rowcount == 0:
                    # check unverified registration
                    cursor = db_conn.cursor()
                    cursor.execute("SELECT r.id, r.email FROM public.\"Registration\" as r WHERE r.state=0 and r.email= %s", [authid])
                    rowcount = cursor.rowcount
                    if rowcount > 0:
                      raise ApplicationError(u"org.kopnik.unverified_registration", "Unverified registration {}".format(authid))

                    raise ApplicationError(u"org.kopnik.incorrect_username_or_password", "Incorrect username or password {}".format(authid))

                for item in cursor.fetchall():
                    if bcrypt.hashpw(bytes(ticket), item[0]) == item[0]:
                        print('Authentication successfull')
                        db_conn.close()
                        return unicode(item[1])
                        #return u'kopnik'

                raise ApplicationError(u"org.kopnik.incorrect_username_or_password", "Incorrect username or password {}".format(authid))


            except Exception as e:
                if not db_conn is None:
                    db_conn.close()
                print(e)
                raise e

        try:
            yield self.register(authenticate, u'org.kopnik.authenticate')
            print("WAMP-Ticket dynamic authenticator registered!")
        except Exception as e:
            self.log.failure()
            #print(u"Failed to register dynamic authenticator: {0}".format(e))
