import { Address, BigInt } from "@graphprotocol/graph-ts"
import { LogFeeTransfer, Transfer } from "../generated/Contract/Contract"
import { Sync } from "../generated/UniV2Pool/UniV2Pool"
import { BurntFee, Fee } from "../generated/schema"

let baseUnit = BigInt.fromI32(10).pow(18).toBigDecimal()

let TWELVE_DECIMALS = BigInt.fromI32(10).pow(12)

export function handleLogFeeTransfer(event: LogFeeTransfer): void {
  let entity = Fee.load('1')

  if (entity == null) {
    entity = new Fee('1')

    entity.totalFees = BigInt.fromI32(0).toBigDecimal()
    entity.totalFeesUSD = BigInt.fromI32(0).toBigDecimal()
    entity.maticPrice = BigInt.fromI32(0).toBigDecimal()
  }

  entity.totalFees = entity.totalFees.plus(event.params.amount.divDecimal(baseUnit))
  entity.totalFeesUSD = entity.totalFeesUSD.plus(event.params.amount.divDecimal(baseUnit).times(entity.maticPrice))

  entity.save()
}

export function handleTransfer(event: Transfer): void {
  if(event.params.to == Address.fromString("0x000000000000000000000000000000000000dEaD") && event.params.from == Address.fromString("0x70bca57f4579f58670ab2d18ef16e02c17553c38") ){
    let entity = BurntFee.load('1')

    if (entity == null) {
      entity = new BurntFee('1')
  
      entity.totalBurntFees = BigInt.fromI32(0).toBigDecimal()
      entity.totalBurntFeesUSD = BigInt.fromI32(0).toBigDecimal()
      entity.maticPrice = BigInt.fromI32(0).toBigDecimal()
    }
  
    entity.totalBurntFees = entity.totalBurntFees.plus(event.params.value.divDecimal(baseUnit))
    entity.totalBurntFeesUSD = entity.totalBurntFeesUSD.plus(event.params.value.divDecimal(baseUnit).times(entity.maticPrice))
  
    entity.save()
  }
}

export function handleQuickswapSync(event: Sync): void {
  let entity = Fee.load('1')!

  entity.maticPrice = event.params.reserve1
    .times(TWELVE_DECIMALS)
    .divDecimal(event.params.reserve0.toBigDecimal())

  entity.save()

  let burnt = BurntFee.load('1')!

  burnt.maticPrice = event.params.reserve1
    .times(TWELVE_DECIMALS)
    .divDecimal(event.params.reserve0.toBigDecimal())

  burnt.save()
  
}
