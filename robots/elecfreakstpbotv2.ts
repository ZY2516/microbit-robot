namespace robot {
    // https://github.com/elecfreaks/pxt-TPBot/blob/master/main.ts
    const i2cAddr = 0x10

    function i2cCommandSend(command: number, params: number[]) {
        let buff = pins.createBuffer(params.length + 4);
        buff[0] = 0xFF; // 帧头
        buff[1] = 0xF9; // 帧头
        buff[2] = command; // 指令
        buff[3] = params.length; // 参数长度
        for (let i = 0; i < params.length; i++) {
            buff[i + 4] = params[i];
        }
        pins.i2cWriteBuffer(i2cAddr, buff);
    }

    function motorControl(leftSpeed: number, rightSpeed: number): void {
        i2cCommandSend(0x10, [Math.abs(leftSpeed), Math.abs(rightSpeed), (leftSpeed < 0 ? 0x01 : 0) | (rightSpeed < 0 ? 0x02 : 0)]);
    }

    class I2CServoArm implements drivers.Arm {

        channel: number

        constructor(channel: number) {
            this.channel = channel;
        }

        start(): void {
        }

        open(aperture: number): void {
            i2cCommandSend(0x20, [this.channel, Math.round(Math.map(100 - aperture, 0, 100, 0, 100))]);
        }
    }

    class ElecfreaksTpbotV2Robot extends robots.Robot {
        constructor() {
            super(0x31e95c0a)
            // this.leds = new drivers.WS2812bLEDStrip(DigitalPin.P15, 8)
            this.sonar = new drivers.SR04Sonar(DigitalPin.P15, DigitalPin.P16)
            this.lineDetectors = new drivers.DigitalPinLineDetectors(
                DigitalPin.P13,
                DigitalPin.P14,
                false
            )
            this.maxLineSpeed = 30
            this.arms = []
            for (let i = 0; i < 4; i++) {
                this.arms.push(new I2CServoArm(i + 1))
            }
        }

        motorRun(left: number, right: number) {
            motorControl(left, right)
        }

        headlightsSetColor(r: number, g: number, b: number) {
            i2cCommandSend(0x30, [r, g, b]);
        }
    }

    /**
     * Cute:bot PRO from Elecfreaks
     */
    //% fixedInstance whenUsed block="elecfreaks tpbot" weight=51
    export const elecfreakstpbotv2 = new RobotDriver(new ElecfreaksTpbotV2Robot())
}
