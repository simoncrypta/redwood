import { normalize } from 'path'
import {
  createConnection,
  InitializeParams,
  ProposedFeatures,
  TextDocuments,
  TextDocumentSyncKind,
} from 'vscode-languageserver'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { CodeAction } from 'vscode-languageserver-types'
import { HostWithDocumentsStore, IDEInfo } from '../ide'
import { RWProject } from '../model'
import { lazy, memo } from '../x/decorators'
import { VSCodeWindowMethods_fromConnection } from '../x/vscode'
import {
  ExtendedDiagnostic_findRelevantQuickFixes,
  Range_contains,
} from '../x/vscode-languageserver-types'
import { CommandsManager } from './commands'
import { DiagnosticsManager } from './diagnostics'
import { OutlineManager } from './outline'
import { XMethodsManager } from './xmethods'

export class RWLanguageServer {
  initializeParams!: InitializeParams
  documents = new TextDocuments(TextDocument)
  connection = createConnection(ProposedFeatures.all)
  @memo() start() {
    const { connection, documents } = this
    connection.onInitialize((params) => {
      connection.console.log(
        `Redwood.js Language Server onInitialize(), PID=${process.pid}`
      )
      this.initializeParams = params
      return {
        capabilities: {
          textDocumentSync: {
            openClose: true,
            change: TextDocumentSyncKind.Full,
          },
          implementationProvider: true,
          definitionProvider: true,
          codeActionProvider: true,
          codeLensProvider: { resolveProvider: false },
          executeCommandProvider: this.commands.options,
          documentLinkProvider: { resolveProvider: false },
          hoverProvider: true,
        },
      }
    })

    connection.onInitialized(async () => {
      connection.console.log('Redwood.js Language Server onInitialized()')
      const folders = await connection.workspace.getWorkspaceFolders()
      if (folders) {
        for (const folder of folders) {
          this.projectRoot = normalize(folder.uri.substr(7)) // remove file://
        }
      }
      this.diagnostics.start()
      this.commands.start()
      this.outline.start()
      this.xmethods.start()
    })

    connection.onImplementation(async ({ textDocument: { uri }, position }) => {
      const info = await this.info(uri, 'Implementation')
      for (const i of info) {
        if (Range_contains(i.location.range, position)) {
          return i.target
        }
      }
    })

    connection.onDefinition(async ({ textDocument: { uri }, position }) => {
      const info = await this.info(uri, 'Definition')
      for (const i of info) {
        if (Range_contains(i.location.range, position)) {
          return i.target
        }
      }
    })

    connection.onDocumentLinks(async ({ textDocument: { uri } }) => {
      return (await this.info(uri, 'DocumentLink')).map((i) => i.link)
    })

    connection.onCodeAction(async ({ context, textDocument: { uri } }) => {
      const actions: CodeAction[] = []
      const node = await this.getProject()?.findNode(uri)
      if (!node) return []
      if (context.diagnostics.length > 0) {
        // find quick-fixes associated to diagnostics
        const xds = await node.collectDiagnostics()
        for (const xd of xds) {
          const as = await ExtendedDiagnostic_findRelevantQuickFixes(
            xd,
            context
          )
          for (const a of as) actions.push(a)
        }
      }
      return actions
    })

    connection.onCodeLens(async ({ textDocument: { uri } }) => {
      return (await this.info(uri, 'CodeLens')).map((i) => i.codeLens)
    })

    connection.onHover(async ({ textDocument: { uri }, position }) => {
      const info = await this.info(uri, 'Hover')
      for (const i of info) {
        if (Range_contains(i.hover.range!, position)) {
          return i.hover
        }
      }
    })

    documents.listen(connection)
    connection.listen()
  }

  @lazy() get diagnostics() {
    return new DiagnosticsManager(this)
  }
  @lazy() get commands() {
    return new CommandsManager(this)
  }
  @lazy() get outline() {
    return new OutlineManager(this)
  }
  @lazy() get xmethods() {
    return new XMethodsManager(this)
  }
  @lazy() get host() {
    return new HostWithDocumentsStore(this.documents)
  }

  projectRoot: string | undefined
  getProject() {
    if (!this.projectRoot) return undefined
    return new RWProject({ projectRoot: this.projectRoot, host: this.host })
  }
  get vscodeWindowMethods() {
    return VSCodeWindowMethods_fromConnection(this.connection)
  }
  async collectIDEInfo(uri?: string) {
    return (await this.getProject()?.collectIDEInfo(uri)) ?? []
  }
  async info<T extends IDEInfo['kind']>(
    uri: string,
    kind: T
  ): Promise<(IDEInfo & { kind: T })[]> {
    return (await this.collectIDEInfo(uri)).filter(
      (i) => i.kind === kind
    ) as any
  }

  get hasWorkspaceFolderCapability() {
    return (
      this.initializeParams.capabilities.workspace?.workspaceFolders === true
    )
  }
}
