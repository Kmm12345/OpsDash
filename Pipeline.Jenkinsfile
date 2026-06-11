pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Backend Dependencies') {
            steps {
                dir('Backend') {
                    bat 'python -m venv venv'
                    bat 'venv\\Scripts\\python.exe -m pip install --upgrade pip'
                    bat 'venv\\Scripts\\python.exe -m pip install -r requirements.txt'
                }
            }
        }

        stage('Backend Validation') {
            steps {
                dir('Backend') {
                    bat 'venv\\Scripts\\python.exe -m py_compile main.py'
                }
            }
        }

        stage('Frontend Dependencies') {
            steps {
                dir('Frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('Frontend') {
                    bat 'npm run build'
                }
            }
        }
    }
}