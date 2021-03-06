module.exports = {
  companyName: 'MY COMPANY NAME',
  rootUrl: 'http://mycompany.com',
  database: {
    host: 'AWS DATABASE',
    port: 'AWS PORT',
    user: 'AWS USERNAME',
    password: 'AWS PASSWORD',
    database: 'AWS DATABASE NAME'
  },
  redis: {
    port: 6379,
    host: 'AWS REPLICATION GROUP ENDPOINT'
  },
  // redisPrefix: '{EMBER APP NAME}:index:',
  indexFileTableName: 'TABLE_NAME_FOR_INDEX_STORAGE', // By default based off ember app name, such as ember_boilerplate_bootstrap
  jwtSecret: 'SECRET STRING',
  sessionSecret: 'SECRET STRING',
  mailchimp: {
    apiKey: 'MAILCHIMP API KEY',
    apiRoot: 'https://us11.api.mailchimp.com/3.0/',
    mailingListId: 'MAILCHIMP MAILING LIST ID',
    signupPathCategory: {
      categoryId: 'MAILCHIMP INTEREST GROUP ID',
      registeredUserId: 'MAILCHIMP GROUP ID',
      mailingListId: 'MAILCHIMP GROUP ID'
    }
  },
  nodemailer: {
    username: 'GMAIL ACCOUNT USERNAME',
    password: 'GMAIL ACCOUNT PASSWORD'
  },
  feedbackEmail: 'FEEDBACK EMAIL ACCOUNT',
  contactEmail: 'CONTACT EMAIL ACCOUNT'
}