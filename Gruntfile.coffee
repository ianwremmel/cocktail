# Generated on 2013-12-30 using generator-library 0.0.1
module.exports = (grunt) ->
  require('load-grunt-tasks')(grunt)

  grunt.registerTask 'build', [
    'clean'
    'jshint'
    'umd'
    'clean:tmp'
  ]

  grunt.registerTask 'test', [
    'build'
    'jasmine'
  ]

  grunt.registerTask 'default', ['test']

  grunt.initConfig
    pkg:
      grunt.file.readJSON 'package.json'

    clean:
      dist: [
        '<%= yeoman.dist %>'
      ]
      tmp: [
        '.tmp'
      ]

    yeoman:
      src: 'src'
      dist: 'dist'
      test: 'spec'

    jshint:
      options:
        reporter: require('jshint-stylish')
        jshintrc: '.jshintrc'
      src: [
          '<%= yeoman.src %>/**/*.js'
        ]

    umd:
      dist:
        src: '<%= yeoman.src %>/index.js'
        dest: '<%= yeoman.dist %>/cocktail.js'
        # dest: '.tmp/cocktail.js'
        objectToExport: 'Cocktail'
        globalAlias: 'Cocktail'
        deps:
          default: ['_']
          amd: ['underscore']
          cjs: ['underscore']
          global: ['_']

    jasmine:
      dist:
        src: '<%= yeoman.dist %>/cocktail.js'
        options:
          specs: '<%= yeoman.test %>/*Spec.js'
          helpers: '<%= yeoman.test %>/*Helper.js'
          vendor: [
            'bower_components/jquery/jquery.js'
            'bower_components/underscore/underscore.js'
            'bower_components/backbone/backbone.js'
          ]
