.PHONY: all clean remove install update build test

all: clean remove install update build

clean  :; forge clean

remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

install:; forge install foundry-rs/forge-std --no-commit && forge install smartcontractkit/chainlink-brownie-contracts@1.2.0 --no-commit && forge install OpenZeppelin/openzeppelin-contracts@v5.0.2 --no-commit

update:; forge update

build:; forge build

test :; forge test