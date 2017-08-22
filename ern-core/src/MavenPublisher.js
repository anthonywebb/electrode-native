// @flow
import type { Publisher } from './Publisher'
import { MavenUtils } from './MavenUtils'
import shell from 'shelljs'
import { Utils, spin } from 'ern-util'
import { exec } from 'child_process'

export default class MavenPublisher implements Publisher {
  _url: string
  _name: string = 'maven'

  constructor ({url = MavenUtils.getDefaultMavenLocalDirectory()}: { url: string } = {}) {
    this._url = url
  }

  get name (): string {
    return this._name
  }

  get url (): string {
    return this._url
  }

  async publish ({workingDir, moduleName}: { workingDir: string, moduleName: string } = {}): any {
    await this.buildAndPublishContainer(workingDir, moduleName)
  }

  async buildAndPublishContainer (workingDir: string, moduleName: string): Promise<*> {
    try {
      log.debug(`[=== Starting build and publication ===]`)
      shell.cd(`${workingDir}`)
      Utils.throwIfShellCommandFailed()
      await spin(`Building project and publishing archive`,
        this.buildAndUploadArchive(moduleName))
      log.debug(`[=== Completed build and publication of the module ===]`)
    } catch (e) {
      log.error('[buildAndPublishAndroidLib] Something went wrong: ' + e)
      throw e
    }
  }

  async buildAndUploadArchive (moduleName: string): Promise<*> {
    let cmd = `./gradlew ${moduleName}:uploadArchives `
    return new Promise((resolve, reject) => {
      exec(cmd,
        (err, stdout, stderr) => {
          if (err) {
            log.error(err)
            reject(err)
          }
          if (stderr) {
            log.error(stderr)
          }
          if (stdout) {
            log.debug(stdout)
            resolve(stdout)
          }
        })
    })
  }
}
