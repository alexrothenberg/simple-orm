abort "Please use Ruby 1.9" if RUBY_VERSION !~ /^1\.9/

require "bundler/setup"

def pipeline
  require 'rake-pipeline'
  Rake::Pipeline::Project.new("Assetfile")
end

desc "Build browser-model.js"
task :pkg do
  pipeline.invoke
end

desc "Clean build artifacts from previous builds"
task :clean do
  puts "Cleaning build..."
  rm_rf "dist"
  puts "Done"
end

begin
  require 'jasmine'
  load 'jasmine/tasks/jasmine.rake'
rescue LoadError
  task :jasmine do
    abort "Jasmine is not available. In order to run jasmine, you must: (sudo) gem install jasmine"
  end
end
