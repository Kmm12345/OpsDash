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

        stage('Stop Dev Application') {
            when {
                expression { params.TARGET_ENV == 'DEV' }
            }

            steps {
                bat '''
                    echo Stopping existing DEV OpsDash processes...

                    powershell -Command "Get-NetTCPConnection -LocalPort 9000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"
                    powershell -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"

                    echo Existing DEV OpsDash processes stopped.
                '''
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

        stage('Start Dev Application') {
            when {
                expression { params.TARGET_ENV == 'DEV' }
            }

            steps {
                bat '''
                    echo Starting DEV OpsDash backend...

                    cd /d "%DEV_DEPLOY_PATH%\\Backend"

                    if not exist venv (
                        python -m venv venv
                    )

                    venv\\Scripts\\python.exe -m pip install -r requirements.txt

                    start "OpsDash DEV Backend" cmd /c "venv\\Scripts\\python.exe -m uvicorn main:app --host 127.0.0.1 --port 9000 > E:\\Deployments\\OpsDash\\Dev\\backend.log 2>&1"

                    echo Starting DEV OpsDash frontend...

                    cd /d "%DEV_DEPLOY_PATH%\\Frontend"
                    start "OpsDash DEV Frontend" cmd /c "python -m http.server 3000 > E:\\Deployments\\OpsDash\\Dev\\frontend.log 2>&1"

                    echo DEV OpsDash start commands issued.
                '''
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
