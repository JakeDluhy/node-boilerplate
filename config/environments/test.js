module.exports = {
  companyName: 'My Company',
  rootUrl: 'http://localhost:3300',
  database: {
    host: '127.0.0.1',
    user: 'jake',//username
    password: '',
    database: 'warscribe_test_db'//my_test_db
  },
  redis: {
    port: 6379,
    host: '127.0.0.1'
  },
  redisPrefix: 'ember-boilerplate:index:',
  jwtSecret: 'mysecrethere',
  sessionSecret: 'mysecrethere',
  mailchimp: {
    apiKey: '',
    apiRoot: 'https://us11.api.mailchimp.com/3.0/',
    mailingListId: '',
    signupPathCategory: {
      categoryId: '',
      registeredUserId: '',
      mailingListId: ''
    }
  },
  nodemailer: {
    username: 'myGmailAccount',
    password: 'myGmailPassword'
  },
  feedbackEmail: 'myFeedbackEmail',
  contactEmail: 'myContactEmail'
}