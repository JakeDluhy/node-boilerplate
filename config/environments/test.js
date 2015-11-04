module.exports = {
  companyName: 'My Company',
  rootUrl: 'http://localhost:3300',
  database: {
    host: '127.0.0.1',
    user: 'username',
    password: '',
    database: 'my_test_db'
  },
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
  contactEmail: 'myContactEmail',
  googleAnalytics: {
    trackingID: ''
  }
}