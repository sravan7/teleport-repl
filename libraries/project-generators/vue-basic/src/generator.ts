import createVueGenerator from '../../../component-generators/vue/vue-component'
import createVueRouterFileGenerator from '../../../component-generators/vue/vue-router'

import { Folder, File, ProjectGeneratorOptions } from '../../types'
import { extractExternalDependencies } from '../../utils/generator-utils'

import vueProjectMapping from './elements-mapping.json'
import customMapping from './custom-mapping.json'

const generateComponent = createVueGenerator({
  customMapping: { ...vueProjectMapping, ...customMapping },
})
const generateRouterFile = createVueRouterFileGenerator()

export default async (
  jsDoc: any,
  { sourcePackageJson, distPath }: ProjectGeneratorOptions = {
    distPath: 'dist',
  }
) => {
  if (jsDoc.schema !== 'project') {
    throw new Error('schema type is not project')
  }

  const { components, root } = jsDoc

  const pagesFolder: Folder = {
    name: 'views',
    files: [],
    subFolders: [],
  }

  const componentsFolder: Folder = {
    name: 'components',
    files: [],
    subFolders: [],
  }

  const srcFolder: Folder = {
    name: 'src',
    files: [],
    subFolders: [componentsFolder, pagesFolder],
  }

  const distFolder: Folder = {
    name: distPath,
    files: [],
    subFolders: [srcFolder],
  }

  let collectedDependencies = {}

  // Router component
  const router = await generateRouterFile(jsDoc)
  collectedDependencies = { ...collectedDependencies, ...router.dependencies }

  const routerFile: File = {
    name: 'router',
    extension: '.js',
    content: router.code,
  }

  srcFolder.files.push(routerFile)

  // pages are written in /views
  const { states } = root
  for (const key of Object.keys(states)) {
    const currentState = states[key]
    const pageComponent = currentState.component
    const pageResult = await generateComponent(pageComponent, {
      localDependenciesPrefix: '../components/',
    })

    collectedDependencies = { ...collectedDependencies, ...pageResult.dependencies }

    pagesFolder.files.push({
      name: pageComponent.name,
      content: pageResult.code,
      extension: '.vue',
    })
  }

  for (const componentName of Object.keys(components)) {
    const component = components[componentName]
    const componentResult = await generateComponent(component)
    collectedDependencies = { ...collectedDependencies, ...componentResult.dependencies }

    const file: File = {
      name: component.name,
      extension: '.vue',
      content: componentResult.code,
    }

    componentsFolder.files.push(file)
  }

  // Package.json
  if (sourcePackageJson) {
    const externalDep = extractExternalDependencies(collectedDependencies)
    sourcePackageJson.dependencies = {
      ...sourcePackageJson.dependencies,
      ...externalDep,
    }

    const packageFile: File = {
      name: 'package',
      extension: '.json',
      content: JSON.stringify(sourcePackageJson, null, 2),
    }

    distFolder.files.push(packageFile)
  }

  return distFolder
}
