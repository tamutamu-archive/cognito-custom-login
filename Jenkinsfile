import groovy.transform.Field

@Library('jenkins-pipeline-utils') _

@Field
def DOCKER_NAME = 'cwds/cognito-custom-login'
@Field
def DOCKER_REGISTRY_CREDENTIALS_ID = '6ba8d05c-ca13-4818-8329-15d41a089ec0'
@Field
def GITHUB_CREDENTIALS_ID = '433ac100-b3c2-4519-b4d6-207c029a103b'
@Field
def SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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'

@Field
def app
@Field
def newTag

switch(env.BUILD_JOB_TYPE) {
  case "master": buildMaster(); break;
  default: buildPullRequest();
}

def buildPullRequest() {
  node('cap-slave') {
   def triggerProperties = githubPullRequestBuilderTriggerProperties()
    properties([
      githubConfig(),
      pipelineTriggers([triggerProperties]),
      buildDiscarderDefaults()
    ])
    try {
      checkoutStage()
      buildDockerImageStage()
      parallel(
        'Lint': { lintStage() },
        'Unit Test': { unitTestStage() }
      )
      checkForLabelPullRequest()
    } catch(Exception exception) {
      currentBuild.result = "FAILURE"
      notifySlack(SLACK_WEBHOOK_URL, "cognito-custom-login", exception)
      throw exception
    } finally {
      cleanupStage()
    }
  }
}

def buildMaster() {
  node('cap-slave') {
    triggerProperties = pullRequestMergedTriggerProperties('cognito-custom-login')
    properties([
      parameters([
        string(name: 'INCREMENT_VERSION', defaultValue: '', description: 'major, minor, or patch')
      ]),
      githubConfig(),
      pipelineTriggers([triggerProperties]),
      buildDiscarderDefaults('master')
    ])

    try {
      checkoutStage()
      // buildDockerImageStage()
      // parallel(
      //   'Lint': { lintStage() },
      //   'Unit Test': { unitTestStage() }
      // )
      incrementTagStage()
      tagRepoStage()
//      publishImageStage()
//      triggerReleasePipeline()
    } catch(Exception exception) {
      currentBuild.result = "FAILURE"
      notifySlack(SLACK_WEBHOOK_URL, "cognito-custom-login", exception)
      throw exception
    } finally {
      cleanupStage()
    }
  }
}

def checkoutStage() {
  stage('Checkout') {
    deleteDir()
    checkout scm
  }
}

def buildDockerImageStage() {
  stage('Build Docker Image') {
    app = docker.build("cwds/cognito-custom-login:${env.BUILD_ID}")
  }
}

def lintStage() {
  stage('Lint') {
    app.withRun("-e CI=true") { container ->
      sh "docker exec -t ${container.id} sh -c 'yarn lint'"
    }
  }
}

def unitTestStage() {
  stage('Unit Test') {
    app.withRun("-e CI=true") { container ->
      sh "docker exec -t ${container.id} sh -c 'yarn test'"
    }
  }
}

def checkForLabelPullRequest() {
  stage('Verify SemVer Label') {
    checkForLabel("cognito-custom-login")
  }
}

def incrementTagStage() {
  stage("Increment Tag") {
    newTag = newSemVer()
  }
}

def tagRepoStage() {
  stage('Tag Repo') {
    tagGithubRepo(newTag, GITHUB_CREDENTIALS_ID)
  }
}

def publishImageStage() {
  stage ('Publish Image'){
    GIT_REFSPEC = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
    app = docker.build("${DOCKER_NAME}:${GIT_REFSPEC}", "--build-arg APP_VERSION=${newTag} -f Dockerfile .")
    withDockerRegistry([credentialsId: DOCKER_REGISTRY_CREDENTIALS_ID]) {
      app.push(newTag)
      app.push('latest')
    }
  }
}


def cleanupStage() {
  stage('Cleanup') {
    cleanWs()
  }
}

def githubConfig() {
  githubConfigProperties('https://github.com/ca-cwds/cognito-custom-login')
}
