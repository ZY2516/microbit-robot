namespace robot {
    // https://github.com/elecfreaks/pxt-TPBot/blob/master/main.ts
    const i2cAddr = 0x10

    function setWheels(leftSpeed: number, rightSpeed: number): void {
        let buf = pins.createBuffer(4)
        buf[0] = 0x01
        buf[1] = Math.abs(leftSpeed)
        buf[2] = Math.abs(rightSpeed)
        buf[3] = (leftSpeed < 0 ? 0x01 : 0x00) | (rightSpeed < 0 ? 0x02 : 0x00)
        pins.i2cWriteBuffer(i2cAddr, buf)
    }

    class I2CServoArm implements drivers.Arm {

        channel: number

        constructor(channel: number) {
            this.channel = channel;
        }

        start(): void {
        }

        open(aperture: number): void {
            let buf = pins.createBuffer(4)
            buf[0] = 0x10 + this.channel - 1;
            buf[1] = Math.round(Math.map(100 - aperture, 0, 100, 0, 100));
            buf[2] = 0;
            buf[3] = 0;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
    }

    class ElecfreaksTpbotRobot extends robots.Robot {
        constructor() {
            super(0x31e95c0a)
            // this.leds = new drivers.WS2812bLEDStrip(DigitalPin.P15, 8)
            this.sonar = new drivers.SR04Sonar(DigitalPin.P15, DigitalPin.P16)
            this.lineDetectors = new drivers.DigitalPinLineDetectors(
                DigitalPin.P13,
                DigitalPin.P14,
                false
            )
            this.maxLineSpeed = 100
            this.arms = []
            for (let i = 0; i < 4; i++) {
                this.arms.push(new I2CServoArm(i + 1))
            }
        }

        motorRun(left: number, right: number) {
            setWheels(left, right)
        }

        headlightsSetColor(r: number, g: number, b: number) {
            const buf = pins.createBuffer(4)
            buf[0] = 0x20;
            buf[1] = r;
            buf[2] = g;
            buf[3] = b;
            pins.i2cWriteBuffer(i2cAddr, buf);
        }
    }

    /**
     * Cute:bot PRO from Elecfreaks
     */
    //% fixedInstance whenUsed block="elecfreaks tpbot" weight=51
    export const elecfreakstpbot = new RobotDriver(new ElecfreaksTpbotRobot())
}
