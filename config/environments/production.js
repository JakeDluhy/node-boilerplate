module.exports = {
  companyName: 'My Company',
  rootUrl: 'http://mycompany.com',
  database: {
    host: 'AWS Database',
    port: 'AWS Port',
    user: 'AWS Username',
    password: 'AWS Password',
    database: 'postgres'
  },
  redis: {
    port: 6379,
    host: 'myRedisClusterEndpoint'
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