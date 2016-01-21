module.exports = {
  companyName: 'My Company',
  rootUrl: 'http://localhost:4200',
  database: {
    host: '127.0.0.1',
    user: 'jake',
    password: '',
    database: 'my_db'
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
    username: '',
    password: ''
  },
  feedbackEmail: 'myFeedbackEmail',
  contactEmail: 'myContactEmail',
  googleAnalytics: {
    trackingID: ''
  }
}