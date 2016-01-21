module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),



    // for changes to the node code
    nodemon: {
      dev: {
        options: {
          file: 'server.js',
          nodeArgs: ['--debug'],
          watchedFolders: ['app'],
          env: {
            PORT: '3300'
          }
        }
      }
    },
  });

  grunt.registerTask('server', ['nodemon:dev']);
};
