pipeline {
  agent none
  stages {
    stage('lint') {
      agent {
        docker {
          image 'node:latest'
        }

      }
      steps {
        sh '''



npm install'''
        sh 'npm run lint'
      }
    }

    stage('Build Image') {
      agent any
      steps {
        script {
          dockerImage = docker.build registry + ":latest"
        }

      }
    }

    stage('Push image') {
      steps {
        script {
          docker.withRegistry( '', registryCredential ) {


            dockerImage.push()
          }
        }

      }
    }

    stage('Remove Image') {
      agent any
      steps {
        sh 'docker rmi -f $registry:latest'
      }
    }

  }
  environment {
    registry = 'guwenqing/datavis-dashboard'
    registryCredential = 'dockerhub'
    dockerImage = ''
  }
}
