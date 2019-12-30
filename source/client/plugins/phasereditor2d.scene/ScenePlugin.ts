namespace phasereditor2d.scene {

    import ide = colibri.ui.ide;

    export const ICON_GROUP = "group";
    export const ICON_TRANSLATE = "translate";
    export const ICON_ANGLE = "angle";
    export const ICON_SCALE = "scale";
    export const ICON_ORIGIN = "origin";

    export class ScenePlugin extends colibri.Plugin {

        private static _instance = new ScenePlugin();

        static getInstance() {
            return this._instance;
        }

        private constructor() {
            super("phasereditor2d.scene");
        }

        registerExtensions(reg: colibri.ExtensionRegistry) {

            // content type resolvers

            reg.addExtension(
                new colibri.core.ContentTypeExtension(
                    [new core.SceneContentTypeResolver()],
                    5
                ));

            // content type renderer

            reg.addExtension(
                new files.ui.viewers.SimpleContentTypeCellRendererExtension(
                    core.CONTENT_TYPE_SCENE,
                    new ui.viewers.SceneFileCellRenderer()
                )
            );

            // icons loader

            reg.addExtension(
                ide.IconLoaderExtension.withPluginFiles(this, [
                    ICON_GROUP,
                    ICON_ANGLE,
                    ICON_ORIGIN,
                    ICON_SCALE,
                    ICON_TRANSLATE
                ])
            );

            // commands

            reg.addExtension(
                new ide.commands.CommandExtension(ui.editor.commands.SceneEditorCommands.registerCommands));

            // editors

            reg.addExtension(
                new ide.EditorExtension([
                    ui.editor.SceneEditor.getFactory()
                ]));

            // new file wizards

            reg.addExtension(
                new ui.dialogs.NewSceneFileDialogExtension());

            // scene object extensions

            reg.addExtension(
                new ui.sceneobjects.ImageExtension(),
                new ui.sceneobjects.ContainerExtension()
            );

            // loader updates

            reg.addExtension(
                new ui.sceneobjects.ImageLoaderUpdater()
            );
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
    }

    colibri.Platform.addPlugin(ScenePlugin.getInstance());
}