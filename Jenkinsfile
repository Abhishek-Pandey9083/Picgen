#!/usr/bin/env groovy
@Library('jenkins_ssdlib@v5')
import org.common.*
import hudson.model.*
import com.jcraft.jsch.Session

String buildResultInformation = ""
String change = ""
boolean buildError = false
boolean buildUnstable = false

String repo = scm.userRemoteConfigs[0].url
String newbuildName = "PicGenFrontend"

String tranferPathOnServer = "C:\\JenkinsTransfers\\PicGenFrontend.zip"
String extractionPathOnServer = "C:\\inetpub\\wwwroot\\ui"

String mailList = env.PicGenMailList

node("master")
{
    common = new SSD.Jenkins.Common(this)
    buildName("${newbuildName}_${BUILD_NUMBER}")

    try
    {
        stage('Cleanup')
        {
            step([$class: 'WsCleanup', cleanWhenFailure: true])
        }

        stage('Checkout')
        {
            common.checkBranchOutOfRepository(repo)
            change = common.getChangeString()
        }

        stage('Run npm build')
        {
            // The strict-ssl config step is necessary to work around the self-signed certificate of our artifactory server.
            Integer statusCode = bat(returnStatus: true, script: """
                    call npm config set strict-ssl false

                    call npm install --registry https://registry.npmjs.org
                    call npm run build

                    call npm config delete strict-ssl
                """)

            log.info("npm build status code: ${statusCode}")

            // Lets check status code and log entries so far because NPM uses the error channel which Jenkins cannot handle corretly so far
            // see https://issues.jenkins.io/browse/JENKINS-44930
            if (statusCode != 0 || currentBuild.rawBuild.log.contains("ERR! code"))
            {
                log.error("Something went wrong with the npm build.")
            }
        }

        stage('Create zip for transfer')
        {
            common.createZipFile("${workspace}\\BuildOutput\\PicGenFrontend.zip", "${workspace}\\build\\*")
        }

        stage('Transfer and extract')
        {
            Session session = common.sshSessionOpen('picgen-web.apex.solution-server.com', 22, 'AWS_PICGEN_PRELIVE_DEPLOY_USER')

            if(session?.isConnected())
            {
                common.sshTransferFileToRemote(session, "${workspace}\\BuildOutput\\PicGenFrontend.zip", tranferPathOnServer)

                // Delete the old conent and extract the transfered build
                common.sshRunRemoteCommand(session, """powershell -command "& {Remove-Item "${extractionPathOnServer}\\*" -Recurse -Force; Expand-Archive -LiteralPath \"${tranferPathOnServer}\" -DestinationPath \"${extractionPathOnServer}\" -Force}" """)

                common.sshSessionClose(session)
            }
            else
            {
                throw new Exception("Session invalid or not connected")
            }
        }

        stage('Archive artifacts')
        {
            archiveArtifacts('BuildOutput\\*.zip')
        }
    }
    catch (e)
    {
        buildError = true
        buildResultInformation = "${e}"
    }
    finally
    {
        common.wrapUpBuild(buildUnstable, buildError, change, mailList, buildResultInformation)
    }
}
