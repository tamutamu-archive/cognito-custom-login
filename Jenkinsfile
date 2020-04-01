import groovy.transform.Field

@Library('jenkins-pipeline-utils') _

@Field
def GITHUB_CREDENTIALS_ID = '433ac100-b3c2-4519-b4d6-207c029a103b'
@Field
def SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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'

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
      //buildDockerImageStage()
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
      parallel(
        'Lint': { lintStage() },
        'Unit Test': { unitTestStage() }
      )
      buildDockerImageStage()
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

def cleanupStage() {
  stage('Cleanup') {
    cleanWs()
  }
}

def githubConfig() {
  githubConfigProperties('https://github.com/ca-cwds/cognito-custom-login')
}
