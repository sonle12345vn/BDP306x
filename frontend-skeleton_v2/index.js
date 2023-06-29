import {
    buildApprovalTx,
    buildSwapTx, buildTransferTx,
    getAllowance,
    getExchangeRate,
    getTokenBalance,
    isTOMO
} from "./services/networkService";
import EnvConfig from "./configs/env";
import BigNumber from "bignumber.js";
import MetamaskService from "./services/accounts/MetamaskService";
import {getWeb3Instance} from "./services/web3Service";

const DEFAULT_APPROVE = 20 * 10 ** 18;

const SignMethod = {
    Metamask: 0, KeyStore: 1, PrivateKey: 2
}
let signMethod = SignMethod.Metamask

const SwapBtnTxt = {
    Approve: "Approve", Swap: "Swap now"
}
let swapBtnTxt = SwapBtnTxt.Swap

$(function () {
    initiateProject();

    function initiateProject() {
        const defaultSrcSymbol = EnvConfig.TOKENS[0].symbol;
        const defaultDestSymbol = EnvConfig.TOKENS[1].symbol;

        initiateDropdown();
        initiateSelectedToken(defaultSrcSymbol, defaultDestSymbol);
        initiateDefaultRate(defaultSrcSymbol, defaultDestSymbol);
        initiateBalance(defaultSrcSymbol, '#swap-balance-from');
        checkApproval(defaultSrcSymbol);
    }

    function initiateDropdown() {
        let dropdownTokens = '';

        EnvConfig.TOKENS.forEach((token) => {
            dropdownTokens += `<div class="dropdown__item">${token.symbol}</div>`;
        });

        $('.dropdown__content').html(dropdownTokens);
    }

    function initiateSelectedToken(srcSymbol, destSymbol) {
        $('#selected-src-symbol').html(srcSymbol);
        $('#selected-dest-symbol').html(destSymbol);
        $('#rate-src-symbol').html(srcSymbol);
        $('#rate-dest-symbol').html(destSymbol);
        $('#selected-transfer-token').html(srcSymbol);
    }

    function initiateDefaultRate(srcSymbol, destSymbol) {
        const srcToken = findTokenBySymbol(srcSymbol);
        const destToken = findTokenBySymbol(destSymbol);
        const defaultSrcAmount = (Math.pow(10, 18)).toString();

        getExchangeRate(srcToken.address, destToken.address, defaultSrcAmount).then((result) => {
            const rate = result / Math.pow(10, 18);
            $('#exchange-rate').html(rate);
        }).catch((error) => {
            console.log(error);
            $('#exchange-rate').html(0);
        });
    }

    function initiateBalance(symbol, id) {
        window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
            const token = findTokenBySymbol(symbol)
            getTokenBalance(token.address, accounts[0]).then((balance) => {
                const balanceWithoutDec = balance / Math.pow(10, 18);
                $(id).html(balanceWithoutDec)
            })
        })
    }

    function checkApproval(srcSymbol) {
        window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
            const srcToken = findTokenBySymbol(srcSymbol);
            if (isTOMO(srcToken.address)) {
                $('#swap-button').html(SwapBtnTxt.Swap)
                return
            }

            getAllowance(srcToken.address, accounts[0], EnvConfig.EXCHANGE_CONTRACT_ADDRESS).then((allow) => {
                if (allow < DEFAULT_APPROVE / 2) {
                    swapBtnTxt = SwapBtnTxt.Approve
                } else {
                    swapBtnTxt = SwapBtnTxt.Swap
                }

                $('#swap-button').html(swapBtnTxt)
            })
        })
    }

    function findTokenBySymbol(symbol) {
        return EnvConfig.TOKENS.find(token => token.symbol === symbol);
    }

    function isSwapActive() {
        const contentId = $('.tab__item--active').attr('data-content-id');
        return contentId === 'swap'
    }

    // On changing token from dropdown.
    $(document).on('click', '.dropdown__item', function () {
        const selectedSymbol = $(this).html();
        $(this).parent().siblings('.dropdown__trigger').find('.selected-target').html(selectedSymbol);


        if (isSwapActive()) {
            const srcSymbol = $('#selected-src-symbol').text();
            const dstSymbol = $('#selected-dest-symbol').text();

            initiateSelectedToken(srcSymbol, dstSymbol);

            initiateDefaultRate(srcSymbol, dstSymbol);
            initiateBalance(srcSymbol, '#swap-balance-from');
        } else {
            const srcSymbol = $('#selected-transfer-token').text();
            initiateBalance(srcSymbol, '#transfer-balance-from');
        }
    });

    // Import Metamask
    $('#import-metamask').on('click', function () {
        window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
            signMethod = SignMethod.Metamask
        })
    });

    // Handle on Source Amount Changed
    $('#swap-source-amount').on('input change', function () {
        let srcSymbol = $('#selected-src-symbol').text();
        let destSymbol = $('#selected-dest-symbol').text();
        const srcToken = findTokenBySymbol(srcSymbol);
        const destToken = findTokenBySymbol(destSymbol);

        const srcAmount = new BigNumber($('#swap-source-amount').val() * 10 ** 18).toFixed()
        getExchangeRate(srcToken.address, destToken.address, srcAmount).then((result) => {
            const rateTo = result / Math.pow(10, 18);
            $('#swap-output').html(rateTo);
        }).catch((error) => {
            console.log(error);
            $('#swap-output').html(0);
        });
    });

    // Handle on click token in Token Dropdown List
    $('.dropdown__item').on('click', function () {
        $(this).parents('.dropdown').removeClass('dropdown--active');
        const newSrc = $(this).text();
        checkApproval(newSrc)
    });

    // Handle on Swap Now button clicked
    $('#swap-button').on('click', function () {
        const modalId = $(this).data('modal-id');
        $(`#${modalId}`).addClass('modal--active');

        const srcSymbol = $('#selected-src-symbol').text();
        const srcToken = findTokenBySymbol(srcSymbol);

        const dstSymbol = $('#selected-dest-symbol').text();
        const dstToken = findTokenBySymbol(dstSymbol);

        const srcAmount = new BigNumber($('#swap-source-amount').val() * 10 ** 18).toFixed()
        const swapOutput = new BigNumber($('#swap-output').text() * 10 ** 18).toFixed();
        const rate = `1 ${$('#rate-src-symbol').text()} = ${$('#exchange-rate').text()} ${$('#rate-dest-symbol').text()}`
        $('#confirm-swap-from').html(`${srcAmount / (10 ** 18)} ${srcSymbol}`)
        $('#confirm-swap-to').html(`${swapOutput / (10 ** 18)} ${dstSymbol}`)
        $('#confirm-swap-rate').html(rate)

        // handle approve transaction
        if ($(this).text() === SwapBtnTxt.Approve) {
            switch (signMethod) {
                case SignMethod.Metamask: {
                    window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
                        const rawTx = buildApprovalTx(srcToken.address, EnvConfig.EXCHANGE_CONTRACT_ADDRESS, BigNumber(DEFAULT_APPROVE).toString());
                        const web3Instance = getWeb3Instance();
                        const metamaskService = new MetamaskService(web3Instance)

                        metamaskService.sendTransaction({
                            from: accounts[0], to: srcToken.address, data: rawTx.encodeABI()
                        }).then((result) => {
                            if (result) {
                                $('#confirm-text').html("Transaction successfully")
                            } else {
                                $('#confirm-text').html("Transaction failed")
                            }
                        });
                    })
                    break
                }
            }
        } else {
            switch (signMethod) {
                case SignMethod.Metamask: {
                    window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
                        const rawTx = buildSwapTx(srcToken.address, dstToken.address, srcAmount)
                        const web3Instance = getWeb3Instance();
                        const metamaskService = new MetamaskService(web3Instance);

                        const txObject = {
                            from: accounts[0], to: EnvConfig.EXCHANGE_CONTRACT_ADDRESS, data: rawTx.encodeABI()
                        }

                        if (isTOMO(srcToken.address)) {
                            txObject.value = srcAmount.toString();
                        }

                        metamaskService.estimateGas(txObject).then((result) => {
                            if (result) {
                                const b = new BigNumber(result.toString()).dividedBy(10 ** 18)
                                $('#confirm-swap-fee').html(`${b.toFixed()} TOMO`)
                            } else {
                                $('#confirm-swap-fee').html("Estimate gas failed")
                            }
                        })
                    })
                    break;
                }
            }
        }
    });

    $('#confirm-swap-button').on('click', function () {
        const srcSymbol = $('#selected-src-symbol').text();
        const srcToken = findTokenBySymbol(srcSymbol);

        const dstSymbol = $('#selected-dest-symbol').text();
        const dstToken = findTokenBySymbol(dstSymbol);

        const srcAmount = new BigNumber($('#swap-source-amount').val() * 10 ** 18).toFixed()
        switch (signMethod) {
            case SignMethod.Metamask: {
                window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
                    const rawTx = buildSwapTx(srcToken.address, dstToken.address, srcAmount)
                    const web3Instance = getWeb3Instance();
                    const metamaskService = new MetamaskService(web3Instance);

                    const txObject = {
                        from: accounts[0], to: EnvConfig.EXCHANGE_CONTRACT_ADDRESS, data: rawTx.encodeABI()
                    }

                    if (isTOMO(srcToken.address)) {
                        txObject.value = srcAmount.toString();
                    }

                    metamaskService.sendTransaction(txObject).then((result) => {
                        if (result) {
                            $('#confirm-text').html("Transaction successfully")
                        } else {
                            $('#confirm-text').html("Transaction failed")
                        }
                    })
                })
                break;
            }
        }
    })

    $('#cancel-swap-button').on('click', function () {
        $('.modal').removeClass('modal--active');
    })

    $('#transfer-button').on('click', function () {
        const modalId = $(this).data('modal-id');
        $(`#${modalId}`).addClass('modal--active');

        const srcSymbol = $('#selected-transfer-token').text();
        const srcToken = findTokenBySymbol(srcSymbol);

        const toAddress = $('#transfer-address').val();

        const srcAmount = new BigNumber($('#transfer-source-amount').val() * 10 ** 18).toFixed()

        window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
            const web3Instance = getWeb3Instance();
            const metamaskService = new MetamaskService(web3Instance);

            let txObject
            if (isTOMO(srcToken.address)) {

                txObject = {
                    from: accounts[0],
                    to: toAddress,
                    value: srcAmount
                }
            } else {
                const rawTx = buildTransferTx(srcToken.address, toAddress, srcAmount);
                txObject = {
                    from: accounts[0], to: srcToken.address, data: rawTx.encodeABI()
                }
            }

            metamaskService.sendTransaction(txObject).then((result) => {
                if (result) {
                    $('#confirm-text').html("Transaction successfully")
                } else {
                    $('#confirm-text').html("Transaction failed")
                }
            })
        })
    });

    // Tab Processing
    $('.tab__item').on('click', function () {
        const contentId = $(this).data('content-id');
        $('.tab__item').removeClass('tab__item--active');
        $(this).addClass('tab__item--active');

        if (contentId === 'swap') {
            $('#swap').addClass('active');
            $('#transfer').removeClass('active');
        } else {
            $('#transfer').addClass('active');
            $('#swap').removeClass('active');

            const srcSymbol = $('#selected-transfer-token').text();
            initiateBalance(srcSymbol, '#transfer-balance-from')
        }
    });

    // Dropdown Processing
    $('.dropdown__trigger').on('click', function () {
        $(this).parent().toggleClass('dropdown--active');
    });

    // Close Modal
    $('.modal').on('click', function (e) {
        if (e.target !== this) return;
        $(this).removeClass('modal--active');
        $('#confirm-text').html("Waiting for confirm")
    });
});
