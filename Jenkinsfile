pipeline {
  agent none
  stages {
    stage('Deploy') {
      agent any
      steps {
          sshagent(credentials: ['datavisssh']) {
           sh 'ssh -o StrictHostKeyChecking=no -l root 39.98.168.0 ls /root/datavis/docker-composer/datavis/start_datavis.sh' 
          }
      }
    }
  }
}
