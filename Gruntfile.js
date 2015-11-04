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

    watch: {
      scripts: {
        files: ['frontend/*.js', 'frontend/**/*.js'],
        tasks: ['browserify:client', 'concat']
      },
      styles: {
        files: ['frontend/styles/*.scss', 'frontend/styles/**/*.scss'],
        tasks: ['sass']
      }
      
    },

    browserify: {
      vendor: {
        src: [],
        dest: 'public/assets/vendor.js',
        options: {
          require: ['react', 'react-router', 'history', 'flux', 'bluebird', 'object-assign', 'reqwest', 'jwt-decode', 'bluebird', 'react-mixin', 'classnames']
        }
      },
      client: {
        src: ['frontend/**/*.js'],
        dest: 'public/assets/frontend.js',
        options: {
          transform: ['reactify', 'babelify'],
          external: ['react', 'react-router', 'history', 'flux', 'bluebird', 'object-assign', 'reqwest', 'jwt-decode', 'bluebird', 'react-mixin', 'classnames']
        }
      }
    },
    sass: {
      dist: {
        files: {
          'public/assets/main.css': 'frontend/styles/main.scss'
        }
      }
    },

    concat: {
      'public/assets/main.js': ['public/assets/vendor.js', 'public/assets/frontend.js']
    },

    shell: {
      mongo: {
        command: 'mongod',
        options: {
          async: true
        }
      }
    },

    concurrent: {
      dev: {
        tasks: ['nodemon:dev', 'shell:mongo', 'watch:scripts', 'watch:styles'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
  });

  grunt.registerTask('server', ['browserify', 'sass', 'concat', 'concurrent:dev']);
  // grunt.registerTask('test:server', ['simplemocha:server']);

  // grunt.registerTask('tdd', ['karma:watcher:start', 'concurrent:test']);

  // grunt.registerTask('test', ['test:server', 'test:client']);
};
