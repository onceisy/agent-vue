pipeline {
   agent any
   environment {
        project="${JOB_NAME}"
        version=sh(script: "echo '${GIT_BRANCH}' | awk -F'/' '{print \$NF}'", returnStdout: true).trim()
        registry='hub.7moor.com'
        num="${sh(script:'date +%Y%m%d%H%M%S', returnStdout: true)}"
   }
   stages {
      stage('构建镜像') {
         steps {
               script {
                echo "$registry"
                echo "$num"
                echo "$project"
                echo "$version"
                echo "-------"
//                 sh "npm config set registry https://mirrors.huaweicloud.com/repository/npm/"
//                 sh "npm install -g pnpm@6"
//                 sh "pnpm config set registry https://registry.npmmirror.com/"
                sh "pnpm install"
                sh "yarn config set ignore-engines true"
                sh "yarn build"
                sh "ls -l"
                sh "docker build . -t $registry/xbot/agent-service-frontend:$version-x-$num"
                sh "docker login $registry -u aixbot -p AIxbot@7moor258"
                sh "docker push $registry/xbot/agent-service-frontend:$version-x-$num"
               }
        }
      }
      stage('发布镜像') {
         steps {
                echo "$registry/xbot/agent-service-frontend:$version-x-$num"
            }
      }
   }
       post {
        success {
            echo '构建成功'
            sh "python3 /opt/send_wx.py -t $version -p $project -i '$registry/xbot/agent-service-frontend:$version-x-$num' -u 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=297fc73c-bce0-4321-bd21-f7b1bdb6655d' -f t"
        }
        failure
        {
           echo '构建失败'
           sh "python3 /opt/send_wx.py -t $version -p $project  -u 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=297fc73c-bce0-4321-bd21-f7b1bdb6655d' -f 0"
        }
    }
}
