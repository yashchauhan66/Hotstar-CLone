pipeline {
    agent any

    environment {
        // Define your SonarQube installation name configured in Jenkins
        HOME_DIR = '/home/ubuntu/Hotstar-CLone'
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout code from Github to Jenkins workspace
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            environment {
                // Ensure you have configured "sonar-scanner" in Jenkins Global Tool Configuration
                scannerHome = tool 'sonar-scanner'
            }
            steps {
                // We use withSonarQubeEnv to connect to the SonarQube Server configured in Jenkins System config
                withSonarQubeEnv('sonar-server') {
                    sh "${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=hotstar-clone \
                        -Dsonar.projectName='Hotstar Clone Microservices' \
                        -Dsonar.sources=. \
                        -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**"
                }
            }
        }

        stage('Quality Gate') {
            steps {
                // Wait for the SonarQube server to process the analysis and return the Quality Gate status
                timeout(time: 10, unit: 'MINUTES') {
                    // Abort the pipeline if code quality fails
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                // SSH into the EC2 instance and run the docker commands
                // 'ec2-ssh-key' must be added inside Jenkins Credentials (SSH Username with private key)
                sshagent(['ec2-ssh-key']) {
                    sh """
                        # Disable strict host key checking to prevent interactive prompts
                        ssh -o StrictHostKeyChecking=no ubuntu@3.7.114.115 << EOF
                            cd ${HOME_DIR}

                            # Pull the latest code from GitHub
                            echo "Pulling latest code from main branch..."
                            git pull origin main

                            # Shut down the existing containers and remove orphans
                            echo "Stopping existing containers..."
                            docker compose down --rmi all --volumes --remove-orphans

                            # Build the new Docker images from scratch without cache
                            echo "Building new Docker images..."
                            docker compose build --no-cache

                            # Start the containers in detached mode
                            echo "Starting containers..."
                            docker compose up -d

                            # Print the status of the containers
                            docker compose ps
EOF
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful! Application is running on the EC2 instance.'
        }
        failure {
            echo 'Pipeline failed. Check the logs for errors in SonarQube or formatting.'
        }
    }
}
