import { HAND_MOVE_SPEED } from "./config/constants";
import { desktopConfig } from "./config/dimentions";
import EventListener from "./EventListener";
import Pit from "./Pit";
import { ImageDimention } from "./TypeDef";

class Hand {
    private ctx: CanvasRenderingContext2D | null
    private handImg: HTMLImageElement
    dimention: ImageDimention = { ...desktopConfig.handDimention };

    moveHand: boolean = false;
    sPit: Pit = null as any;
    dPit: Pit = null as any;
    cycles: number = 0;
    currentCycle: number = 0;
    overPit: Pit = null as any;
    totalSteps: number = 0;

    constructor(ctx: CanvasRenderingContext2D | null, handImg: HTMLImageElement) {
        this.ctx = ctx;
        this.handImg = handImg
    }

    draw(dimentions: ImageDimention) {
        this.ctx?.drawImage(
            this.handImg,
            dimentions.sX,
            dimentions.sY,
            dimentions.sWidth,
            dimentions.sHeight,
            dimentions.dX - 20,
            dimentions.dY - 20,
            dimentions.dWidth,
            dimentions.dHeight
        )

        this.dimention = { ...dimentions }
    }

    private calculateHandMovement() {
        let moveByPxl = { x: HAND_MOVE_SPEED, y: 0, height: 0, width: 0 };

        if (this.dimention.dX <= desktopConfig.pitsDimention[11].dX && this.dimention.dY < desktopConfig.pitsDimention[0].dY) {
            if (this.dimention.dX < desktopConfig.pitsDimention[11].dX) {
                this.dimention.dX = desktopConfig.pitsDimention[11].dX;
            }
            if (this.dimention.dY === desktopConfig.pitsDimention[11].dY) {
                this.currentCycle += 1;
            }
            moveByPxl.x = 0;
            moveByPxl.y = Math.min(HAND_MOVE_SPEED, desktopConfig.pitsDimention[0].dY - this.dimention.dY);
        } else if (this.dimention.dX >= desktopConfig.pitsDimention[5].dX && this.dimention.dY > desktopConfig.pitsDimention[6].dY) {
            if (this.dimention.dX > desktopConfig.pitsDimention[5].dX) {
                this.dimention.dX = desktopConfig.pitsDimention[5].dX;
            }
            moveByPxl.x = 0;
            moveByPxl.y = -Math.min(HAND_MOVE_SPEED, this.dimention.dY - desktopConfig.pitsDimention[6].dY);
        } else if (this.dimention.dY <= desktopConfig.pitsDimention[6].dY) {
            moveByPxl.x = -HAND_MOVE_SPEED;
            moveByPxl.y = 0;
        }

        return moveByPxl;
    }

    public update(handEventListener: EventListener) {
        if (this.moveHand) {
            if (!this.dPit) return;

            let moveByPxl = this.calculateHandMovement();
            this.dimention.dX += moveByPxl.x;
            this.dimention.dY += moveByPxl.y;
            this.dimention.dWidth += moveByPxl.width;
            this.dimention.dHeight += moveByPxl.height;

            handEventListener.eventCallback({
                clientX: this.dimention.dX,
                clientY: this.dimention.dY
            } as HandEvent);

            this.draw(this.dimention);
        }

        this.moveHand = !(this.totalSteps === 0);
    }

    getDimention() {
        return this.dimention;
    }

}

interface HandEvent {
    clientX: number
    clientY: number
}

export type { HandEvent }
export { Hand }