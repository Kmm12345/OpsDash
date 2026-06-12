pipeline {
    agent any

    parameters {
        choice(
            name: 'TARGET_ENV',
            choices: ['DEV', 'PROD'],
            description: 'Select deployment environment'
        )
    }

    environment {
        DEV_DEPLOY_PATH  = 'E:\\Deployments\\OpsDash\\Dev'
        PROD_DEPLOY_PATH = 'E:\\Deployments\\OpsDash\\Prod'
    }

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
                    echo 'Backend validation completed successfully.'
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

        stage('Validate Deployment Target') {
            steps {
                script {
                    if (params.TARGET_ENV == 'PROD' && env.BRANCH_NAME != 'main') {
                        error('PROD deployments are only allowed from the main branch.')
                    }

                    echo "Deployment target validated: ${params.TARGET_ENV}"
                }
            }
        }

        stage('Deploy Application') {
            steps {
                script {
                    if (params.TARGET_ENV == 'PROD') {
                        bat '''
                            if not exist "%PROD_DEPLOY_PATH%" mkdir "%PROD_DEPLOY_PATH%"
                            if not exist "%PROD_DEPLOY_PATH%\\Frontend" mkdir "%PROD_DEPLOY_PATH%\\Frontend"
                            if not exist "%PROD_DEPLOY_PATH%\\Backend" mkdir "%PROD_DEPLOY_PATH%\\Backend"

                            xcopy Frontend\\dist "%PROD_DEPLOY_PATH%\\Frontend" /E /Y /I
                            xcopy Backend "%PROD_DEPLOY_PATH%\\Backend" /E /Y /I

                            echo Production file deployment completed successfully.
                        '''
                    } else {
                        bat '''
                            if not exist "%DEV_DEPLOY_PATH%" mkdir "%DEV_DEPLOY_PATH%"
                            if not exist "%DEV_DEPLOY_PATH%\\Frontend" mkdir "%DEV_DEPLOY_PATH%\\Frontend"
                            if not exist "%DEV_DEPLOY_PATH%\\Backend" mkdir "%DEV_DEPLOY_PATH%\\Backend"

                            xcopy Frontend\\dist "%DEV_DEPLOY_PATH%\\Frontend" /E /Y /I
                            xcopy Backend "%DEV_DEPLOY_PATH%\\Backend" /E /Y /I

                            echo Development file deployment completed successfully.
                        '''
                    }
                }
            }
        }

        stage('Create Release Tag') {
            when {
                allOf {
                    branch 'main'
                    expression { params.TARGET_ENV == 'PROD' }
                }
            }

            steps {
                bat '''
                    git config user.name "Jenkins"
                    git config user.email "jenkins@local"

                    git tag -a v0.1.%BUILD_NUMBER% -m "Successful PROD deployment build %BUILD_NUMBER%"
                    git push origin v0.1.%BUILD_NUMBER%

                    echo Release tag v0.1.%BUILD_NUMBER% created and pushed successfully.
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully for ${params.TARGET_ENV}."
        }

        failure {
            echo "Pipeline failed for ${params.TARGET_ENV}."
        }
    }
}
