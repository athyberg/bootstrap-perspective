module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    autoprefixer: {
      dist: {
        files: {
          'src/bootstrap-perspective.css': 'src/main.css'
        }
      }
    },
    watch: {
      styles: {
         files: ['src/*.css'],
         tasks: ['autoprefixer']
       }
    },
    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js']
    },
    copy: {
      main: {
        files: [{
          expand: true,
          flatten: true,
          cwd: '.',
          src: ['src/bootstrap-perspective.js', 'src/bootstrap-perspective.css', 'LICENSE'],
          dest: 'dist/'
        },
        {
          expand: true,
          flatten: true,
          cwd: '.',
          src: ['dist/*.js'],
          dest: 'examples/js'
        },
        {
          expand: true,
          flatten: true,
          cwd: '.',
          src: ['dist/*.css'],
          dest: 'examples/css'
        }]
      }
    }
  });

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'uglify', 'autoprefixer', 'copy']);

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
};
