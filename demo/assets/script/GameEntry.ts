import { _decorator, BufferAsset, Color, Component, Graphics, JsonAsset, Node, Prefab, rect, screen, SpriteFrame, v2, view } from 'cc';
import { Direction } from './ecs/component/basics/Direction';
import { Position } from './ecs/component/basics/Position';
import { Speed } from './ecs/component/basics/Speed';
import { QuadTree } from './ecs/component/singleton/QuadTree';
import { ecs, KunpoAssets, KunpoQuadtree } from './header';
import { WorldHelper } from './WorldHelper';
const { ccclass, property, menu } = _decorator;
@ccclass("GameEntry")
@menu("kunpo/GameEntry")
export class GameEntry extends Component {
    @property({ type: JsonAsset, displayName: "配置文件", tooltip: "通过kunpo-ec插件导出的配置文件" })
    private ecConfig: JsonAsset = null;

    @property(Node)
    private stage: Node = null;

    @property(Node)
    private btnAddEntity: Node = null;


    private isInit: boolean = false;

    start(): void {
        this.btnAddEntity.active = false;

        ecs.Data.parse(this.ecConfig.json);
        WorldHelper.register(this.stage);

        this.loadResources();
    }

    /** 2. 加载剩余资源 */
    private loadResources(): void {
        let paths: KunpoAssets.IAssetConfig[] = [
            { path: "prefab", type: Prefab },
            { path: "config/buffer", type: BufferAsset },
            { path: "icon", type: SpriteFrame },
        ];
        let loader = new KunpoAssets.AssetLoader("load");
        loader.start({
            configs: paths,
            complete: () => {
                this.initWorld();
            },
            fail: (msg: string, err: Error) => {

            },
            progress: (percent: number) => {

            }
        });
    }

    private initWorld(): void {
        if (this.isInit) {
            return;
        }
        this.isInit = true;

        this.btnAddEntity.active = true;

        // 配置一些单例组件
        let width = screen.windowSize.width / view.getScaleX();
        let height = screen.windowSize.height / view.getScaleY();

        let graphicsNode = new Node("graphics");
        let graphics = graphicsNode.addComponent(Graphics);
        graphicsNode.setPosition(0, 0);
        graphicsNode.layer = 1 << 1;
        WorldHelper.node.addChild(graphicsNode);

        graphics.lineWidth = 6;
        graphics.strokeColor = Color.RED;

        WorldHelper.addSingleton(QuadTree).quadTree = new KunpoQuadtree.QuadTree(rect(-width * 0.5 - 200, -height * 0.5 - 200, width + 400, height + 400), 0, graphics);
    }

    protected update(dt: number): void {
        if (!this.isInit) {
            return;
        }
        WorldHelper.world.update(dt);
    }

    public onCreateEntity(): void {
        for (let i = 0; i < 20; i++) {
            let dir = v2(Math.randRange(-1, 1), Math.randRange(-1, 1));
            dir = dir.normalize();

            WorldHelper.world.createEntity("entity1", {
                [Position.cname]: { x: Math.randRange(-300, 300), y: Math.randRange(-300, 300) },
                [Speed.cname]: { speed: Math.randRange(100, 200) },
                [Direction.cname]: { x: dir.x, y: dir.y }
            });
        }
    }
}