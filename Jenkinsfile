#!groovy

final defaultDeployGroup = 'dev'
final projectName = 'qr-landing'
final projectAPIContainer = 'alloca/qr-landing'
final projectWorkdir = '.'
final buildAPICmd = '''
    export DOCKER_BUILDKIT=1
    docker build \
        --compress=true \
        --progress=plain \
        --label version=${GIT_BRANCH} \
        -t ${REG_HOSTNAME}/${PROJECT_API_CONTAINER}:${GIT_BRANCH} \
        .
'''
final publishAPICmd = '''
    echo "${REG_PASSWORD}" | docker login "${REG_HOSTNAME}" --username="${REG_USERNAME}" --password-stdin
    docker push ${REG_HOSTNAME}/${PROJECT_API_CONTAINER}:${GIT_BRANCH}
'''

pipeline {
    agent { label "docker" }
    environment {
        ANSIBLE_HOST_KEY_CHECKING = 'False'
        REG_HOSTNAME = 'registry.alloca.cloud'
        REG_USERNAME = 'qr-landing'
        PROJECT_NAME = "${projectName}"
        PROJECT_WORKDIR = "${projectWorkdir}"
        PROJECT_API_CONTAINER = "${projectAPIContainer}"
        }
    parameters {
        string(
            name: 'DEPLOY_GROUP',
            defaultValue: defaultDeployGroup,
            description: 'Group name in ansible inventory file')
        string(
            name: 'DEPLOY_STATE',
            defaultValue: 'deploy',
            description: 'One of the states: deploy, absent, balancer')
    }
    stages {
        stage('debug') {
            steps {
                sh "env | sort"
            }
        }
        stage('build') {
            when { allOf {
                expression { params.DEPLOY_STATE == 'deploy' }
            }}
            steps {
                sh "${buildAPICmd}"
            }
        }
        stage('publish') {
            when { allOf {
                expression { params.DEPLOY_STATE == 'deploy' }
            }}
            steps {
                withCredentials([
                    string(credentialsId: 'oms_registry_password', variable: 'REG_PASSWORD')
                ]) {
                    sh "${publishAPICmd}"
                }
            }
        }
        stage('deploy') {
            steps {
                sshagent(credentials: ['jen-user']) {
                    sh '''
                    cd playbook
                    ansible-playbook -i hosts deploy-host.yml \
                    --tags ${DEPLOY_STATE} \
                    -e deploy_group=${DEPLOY_GROUP} \
                    -e project_tag=${GIT_BRANCH}
                    '''
                }
            }
        }
    }
}
