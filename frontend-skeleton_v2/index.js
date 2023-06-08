import {buildApprovalTx, buildSwapTx, getAllowance, getExchangeRate, isEth} from "./services/networkService";
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

    function checkApproval(srcSymbol) {
        window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
            const srcToken = findTokenBySymbol(srcSymbol);
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

    // On changing token from dropdown.
    $(document).on('click', '.dropdown__item', function () {
        const selectedSymbol = $(this).html();
        $(this).parent().siblings('.dropdown__trigger').find('.selected-target').html(selectedSymbol);

        const srcSymbol = $('#selected-src-symbol').text();
        const dstSymbol = $('#selected-dest-symbol').text();

        initiateSelectedToken(srcSymbol, dstSymbol);
        initiateDefaultRate(srcSymbol, dstSymbol);
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

        if ($(this).text() === SwapBtnTxt.Approve) {
            switch (signMethod) {
                case SignMethod.Metamask: {
                    window.ethereum.request({method: 'eth_requestAccounts'}).then((accounts) => {
                        const rawTx = buildApprovalTx(srcToken.address, EnvConfig.EXCHANGE_CONTRACT_ADDRESS, BigNumber(DEFAULT_APPROVE).toString());
                        const web3Instance = getWeb3Instance();
                        const metamaskService = new MetamaskService(web3Instance)

                        metamaskService.sendTransaction({
                            from: accounts[0], to: srcToken.address, data: rawTx.encodeABI()
                        })
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

                        if (isEth(srcToken.address)) {
                            txObject.value = srcAmount.toString();
                        }

                        metamaskService.sendTransaction(txObject)
                    })
                    break;
                }
            }
        }
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
    });
});
