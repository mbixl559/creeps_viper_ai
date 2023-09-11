module.exports = function(grunt) {
    require('time-grunt')(grunt);

    var config = require('./.screeps.json')

    var branch = grunt.option("branch") || config.branch;
    var email = grunt.option("email") || config.email;
    var password = grunt.option("password") || config.password;
    var ptr = grunt.option("ptr") ? true : config.ptr;

    var private_directory = grunt.option('private_directory') || config.private_directory;

    grunt.loadNpmTasks('grunt-screeps');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-file-append');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks("grunt-browserify");

    var current_date = new Date();

    grunt.log.subhead('Task Start: ' + current_date.toLocaleDateString());
    grunt.log.writeln('Branch: ' + branch);

    grunt.initConfig({
        screeps: {
            options: {
                email: config.email,
                password: config.password,
                branch: config.branch,
                ptr: config.ptr
            },
            dist: {
                src: ['tsc_out/*.js']
            }
        },

        clean: {
            'dist': ['tmp','dist', 'tsc_out']
        },

        copy: {
            screeps: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**',
                    dest: 'dist/',
                    filter: 'isFile',
                    rename: function(dest, src) {
                        return dest + src.replace(/\//g,'_');
                    }
                }],
            }
        },

        file_append: {
            versioning: {
                files: [
                    {
                        append: "\nglobal.SCRIPT_VERSION = " + current_date.getTime() + "\n",
                        input: 'dist/version.js',
                    }
                ]
            }
        },

        rsync: {
            options: {
                args: ["--verbose", "--checksum"],
                exclude: [".git*"],
                recursive: true
            },
            private: {
                options: {
                    src: './dist/',
                    dest: private_directory + "/" + branch,
                }
            }
        },

        jsbeautifier: {
            modify: {
                src: ["src/**/*.js"],
                options: {
                    config: '.jsbeautifyrc'
                }
            },
            verify: {
                src: ["src/**/*.js"],
                options: {
                    mode: 'VERIFY_ONLY',
                    config: '.jsbeautifyrc'
                }
            }
        },

        browserify: {
            all: {
              src: ["src/main.ts", "!node_modules/*"],
              dest: "dist/main.js",
              options: {
                plugin: ["tsify"],
              },
            },
          }
    });

    grunt.registerTask('default', ['clean', 'copy:screeps', 'file_append:versioning', 'screeps']);
    grunt.registerTask('private', ['clean', 'copy:screeps', 'file_append:versioning', 'rsync:private']);

    grunt.registerTask('private-no-sync', ['clean', 'copy:screeps', 'file_append:versioning']);

    grunt.registerTask('build', ['clean', 'browserify']);

    grunt.registerTask('push', ['screeps']);
    grunt.registerTask('clean', ['clean']);
    
    grunt.registerTask('test',     ['jsbeautifier:verify']);
    grunt.registerTask('pretty',   ['jsbeautifier:modify']);
}