pipeline {
  agent none
  stages {
    stage('Deploy') {
      agent any
      steps {
          sshagent(['datavisssh']) {
           sh 'ssh -o StrictHostKeyChecking=no root@39.98.168.0 /root/datavis/docker-composer/datavis/start_datavis.sh' 
          }
      }
    }
  }
}
