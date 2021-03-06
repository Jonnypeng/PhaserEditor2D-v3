namespace phasereditor2d.scene {

    import ide = colibri.ui.ide;
    import controls = colibri.ui.controls;

    export const ICON_GROUP = "group";
    export const ICON_TRANSLATE = "translate";
    export const ICON_ANGLE = "angle";
    export const ICON_SCALE = "scale";
    export const ICON_ORIGIN = "origin";
    export const ICON_SELECT_REGION = "select-region";
    export const ICON_BUILD = "build";
    export const ICON_LOCKED = "locked";
    export const ICON_UNLOCKED = "unlocked";
    export const ICON_LIST = "list";
    export const ICON_USER_COMPONENT = "user-component";

    export class ScenePlugin extends colibri.Plugin {

        private static _instance = new ScenePlugin();

        static DEFAULT_CANVAS_CONTEXT = Phaser.CANVAS;

        static DEFAULT_EDITOR_CANVAS_CONTEXT = Phaser.WEBGL;

        private _sceneFinder: core.json.SceneFinder;

        private _docs: phasereditor2d.ide.core.PhaserDocs;

        static getInstance() {
            return this._instance;
        }

        private constructor() {
            super("phasereditor2d.scene");

            this._docs = new phasereditor2d.ide.core.PhaserDocs(this, "data/phaser-docs.json");
        }

        getPhaserDocs() {
            return this._docs;
        }

        registerExtensions(reg: colibri.ExtensionRegistry) {

            this._sceneFinder = new core.json.SceneFinder();

            // preload docs

            reg.addExtension(new ide.PluginResourceLoaderExtension(async () => {
                await ScenePlugin.getInstance().getPhaserDocs().preload();
            }));

            // preload project

            reg.addExtension(this._sceneFinder.getProjectPreloader());

            // content type resolvers

            reg.addExtension(
                new colibri.core.ContentTypeExtension(
                    [new core.SceneContentTypeResolver()],
                    5
                ));

            reg.addExtension(
                new colibri.core.ContentTypeExtension(
                    [new colibri.core.ContentTypeResolverByExtension(
                        core.CONTENT_TYPE_USER_COMPONENTS + "Resolver",
                        [
                            ["components", core.CONTENT_TYPE_USER_COMPONENTS]
                        ])
                    ])
            )

            // content type renderer

            reg.addExtension(
                new files.ui.viewers.SimpleContentTypeCellRendererExtension(
                    core.CONTENT_TYPE_SCENE,
                    new ui.viewers.SceneFileCellRenderer()
                )
            );

            reg.addExtension(
                colibri.ui.ide.ContentTypeIconExtension.withPluginIcons(this, [
                    {
                        iconName: ICON_USER_COMPONENT,
                        contentType: core.CONTENT_TYPE_USER_COMPONENTS
                    }
                ]));

            // icons loader

            reg.addExtension(
                ide.IconLoaderExtension.withPluginFiles(this, [
                    ICON_GROUP,
                    ICON_ANGLE,
                    ICON_ORIGIN,
                    ICON_SELECT_REGION,
                    ICON_SCALE,
                    ICON_TRANSLATE,
                    ICON_BUILD,
                    ICON_LOCKED,
                    ICON_UNLOCKED,
                    ICON_LIST,
                    ICON_USER_COMPONENT
                ])
            );

            // loader updates

            reg.addExtension(
                new ui.sceneobjects.ImageLoaderUpdater(),
                new ui.sceneobjects.BitmapFontLoaderUpdater()
            );

            // commands

            reg.addExtension(
                new ide.commands.CommandExtension(ui.editor.commands.SceneEditorCommands.registerCommands));

            reg.addExtension(
                new ide.commands.CommandExtension(ui.editor.usercomponent.UserComponentsEditor.registerCommands));


            // compile project

            reg.addExtension(
                new ui.editor.usercomponent.UserComponentCompileAllExtension(),
                new core.code.SceneCompileAllExtension());

            // editors

            reg.addExtension(
                new ide.EditorExtension([
                    ui.editor.SceneEditor.getFactory(),
                    ui.editor.usercomponent.UserComponentsEditor.getFactory()
                ]));

            // new file wizards

            reg.addExtension(
                new ui.dialogs.NewSceneFileDialogExtension(),
                new ui.dialogs.NewPrefabFileDialogExtension(),
                new ui.dialogs.NewUserComponentsFileDialogExtension()
            );

            // file properties

            reg.addExtension(new files.ui.views.FilePropertySectionExtension(
                page => new ui.SceneFileSection(page),
                page => new ui.ManySceneFileSection(page)
            ));

            // scene object extensions

            reg.addExtension(
                ui.sceneobjects.ImageExtension.getInstance(),
                ui.sceneobjects.SpriteExtension.getInstance(),
                ui.sceneobjects.TileSpriteExtension.getInstance(),
                ui.sceneobjects.TextExtension.getInstance(),
                ui.sceneobjects.BitmapTextExtension.getInstance(),
                ui.sceneobjects.ContainerExtension.getInstance()
            );

            // property sections

            reg.addExtension(new ui.editor.properties.SceneEditorPropertySectionExtension(
                page => new ui.sceneobjects.GameObjectVariableSection(page),
                page => new ui.sceneobjects.PrefabInstanceSection(page),
                page => new ui.sceneobjects.UserComponentInstancePropertySection(page),
                page => new ui.sceneobjects.ListVariableSection(page),
                page => new ui.sceneobjects.GameObjectListSection(page),
                page => new ui.sceneobjects.ParentSection(page),
                page => new ui.sceneobjects.ContainerSection(page),
                page => new ui.sceneobjects.TransformSection(page),
                page => new ui.sceneobjects.OriginSection(page),
                page => new ui.sceneobjects.FlipSection(page),
                page => new ui.sceneobjects.VisibleSection(page),
                page => new ui.sceneobjects.AlphaSection(page),
                page => new ui.sceneobjects.TintSection(page),
                page => new ui.sceneobjects.TileSpriteSection(page),
                page => new ui.sceneobjects.TextureSection(page),
                page => new ui.sceneobjects.TextContentSection(page),
                page => new ui.sceneobjects.TextSection(page),
                page => new ui.sceneobjects.BitmapTextSection(page),
                page => new ui.sceneobjects.ListSection(page)
            ));

            // scene tools

            reg.addExtension(new ui.editor.tools.SceneToolExtension(
                new ui.sceneobjects.TranslateTool(),
                new ui.sceneobjects.RotateTool(),
                new ui.sceneobjects.ScaleTool(),
                new ui.sceneobjects.OriginTool(),
                new ui.sceneobjects.TileSpriteSizeTool(),
                new ui.sceneobjects.SelectionRegionTool(),
                new ui.sceneobjects.PanTool(),
            ));
        }

        getTools() {
            return colibri.Platform.getExtensions<ui.editor.tools.SceneToolExtension>
                (ui.editor.tools.SceneToolExtension.POINT_ID)
                .flatMap(ext => ext.getTools());
        }

        getTool(toolId: string) {
            return this.getTools().find(tool => tool.getId() === toolId);
        }

        getDefaultSceneSettings() {

            const settings = new core.json.SceneSettings();

            try {

                const finder = ScenePlugin.getInstance().getSceneFinder();

                const files = [...finder.getSceneFiles()];

                files.sort((a, b) => b.getModTime() - a.getModTime());

                if (files.length > 0) {

                    const file = files[0];

                    settings.readJSON(finder.getSceneData(file).settings);
                }

            } catch (e) {

                console.error(e);
            }

            return settings;
        }

        createUserPropertyTypes() {

            // TODO: we should do this via extension
            return [
                new ui.sceneobjects.NumberPropertyType(),
                new ui.sceneobjects.StringPropertyType(),
                new ui.sceneobjects.BooleanPropertyType(),
                new ui.sceneobjects.ExpressionPropertyType(),
                new ui.sceneobjects.OptionPropertyType(),
            ];
        }

        createUserPropertyType(typeId: string) {

            return this.createUserPropertyTypes().find(t => t.getId() === typeId);
        }

        getSceneFinder() {
            return this._sceneFinder;
        }

        getObjectExtensions(): ui.sceneobjects.SceneObjectExtension[] {
            return colibri.Platform
                .getExtensions<ui.sceneobjects.SceneObjectExtension>(ui.sceneobjects.SceneObjectExtension.POINT_ID);
        }

        getObjectExtensionByObjectType(type: string) {
            return this.getObjectExtensions().find(ext => ext.getTypeName() === type);
        }

        getLoaderUpdaterForAsset(asset: any) {

            const exts = colibri.Platform
                .getExtensions<ui.sceneobjects.LoaderUpdaterExtension>(ui.sceneobjects.LoaderUpdaterExtension.POINT_ID);

            for (const ext of exts) {

                if (ext.acceptAsset(asset)) {

                    return ext;
                }
            }

            return null;
        }

        getLoaderUpdaters() {

            const exts = colibri.Platform
                .getExtensions<ui.sceneobjects.LoaderUpdaterExtension>(ui.sceneobjects.LoaderUpdaterExtension.POINT_ID);

            return exts;
        }

        async compileAll() {

            const files = this._sceneFinder.getSceneFiles();

            const dlg = new controls.dialogs.ProgressDialog();

            dlg.create();
            dlg.setTitle("Compiling Scene Files");

            const monitor = new controls.dialogs.ProgressDialogMonitor(dlg);

            monitor.addTotal(files.length);

            for (const file of files) {

                const data = this.getSceneFinder().getSceneData(file);

                const scene = await ui.OfflineScene.createScene(data);

                const compiler = new core.code.SceneCompiler(scene, file);

                await compiler.compile();

                scene.destroyGame();

                monitor.step();
            }

            dlg.close();
        }
    }

    colibri.Platform.addPlugin(ScenePlugin.getInstance());
}