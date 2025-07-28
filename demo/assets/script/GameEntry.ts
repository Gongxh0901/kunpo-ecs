import { _decorator, BufferAsset, Color, Component, EventTouch, Graphics, JsonAsset, Node, Prefab, screen, SpriteFrame, v2, view } from 'cc';
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

    @property(Node)
    private touchNode: Node = null;

    private graphics: Graphics = null;

    private _entity: ecs.Entity = null;

    private isInit: boolean = false;

    start(): void {
        this.btnAddEntity.active = false;

        ecs.Data.parse(this.ecConfig.json);
        WorldHelper.register(this.stage);

        this.loadResources();

        this.touchNode.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.touchNode.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.touchNode.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
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

        graphics.lineWidth = 8;
        graphics.strokeColor = Color.RED;
        this.graphics = graphics;

        WorldHelper.addSingleton(QuadTree).quadTree = new KunpoQuadtree.QuadTree(-width * 0.5 - 200, -height * 0.5 - 200, width + 400, height + 400, 3, 20);
    }

    protected update(dt: number): void {
        if (!this.isInit) {
            return;
        }
        WorldHelper.world.update(dt);

        /** 绘制四叉树 debug */
        let tree = WorldHelper.getSingleton(QuadTree).quadTree;
        const bounds = tree.getTreeBounds();
        this.graphics.clear();
        for (let i = 0; i < bounds.length; i++) {
            let bound = bounds[i];
            this.graphics.rect(bound.x, bound.y, bound.width, bound.height);
        }
        this.graphics.stroke();
        /** 绘制四叉树 debug */
    }

    public onCreateEntity(): void {
        this.createMoreEntity();
        // this.createFixedEntity();
    }

    public createMoreEntity(): void {
        let speed = 100;
        for (let i = 0; i < 2000; i++) {
            // 角度转弧度
            let angle = i;
            let radian = angle * Math.PI / 180;
            let dir = v2(Math.cos(radian), Math.sin(radian));

            dir = dir.normalize();

            speed += 10;
            if (speed > 300) {
                speed = 100;
            }

            WorldHelper.world.createEntity("entity1", {
                [Position.cname]: { x: dir.x * 100, y: dir.y * 100 },
                [Speed.cname]: { speed: speed },
                [Direction.cname]: { x: dir.x, y: dir.y }
            });
        }
    }

    private createFixedEntity(): void {
        WorldHelper.world.createEntity("entity3");
        WorldHelper.world.createEntity("entity4");

        this._entity = WorldHelper.world.createEntity("entity3").entity;
    }

    private onTouchStart(event: EventTouch): void {
    }

    private onTouchMove(event: EventTouch): void {
        if (!this._entity) {
            return;
        }
        let pos = WorldHelper.world.getComponent(this._entity, Position);
        pos.x = event.touch.getLocation().x - 750 * 0.5;
        pos.y = event.touch.getLocation().y - 1334 * 0.5;
    }

    private onTouchEnd(event: EventTouch): void {
    }
}