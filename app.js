const principalAmountInput  = document.querySelector('#principalAmount')
const interestRateInput  = document.querySelector('#interestRate')
const bankDepositYearInput  = document.querySelector('#bankDepositYear')
const activeInvestmentYearInput  = document.querySelector('#activeInvestmentYear')
const invesmentTypeInputs = document.querySelectorAll('[name="investmentType"]')

const output  = document.querySelector('.output')
const yearlyBreakDownList  = document.querySelector(".yearlyBreakDown")


function calculateTotalWithInterest(_principal, options) {

    // default options.yearlyInterest
    let interestRate = Number(interestRateInput.value);

    if(options?.monthlyInterest) {
        interestRate /= 12;
    }

    const interest = (_principal*interestRate) / 100;
     
    return _principal + interest;
}


function getTotalAmount() {
    const bankDepositYear = Number(bankDepositYearInput.value);
    const activeInvesmentYear = Number(activeInvestmentYearInput.value);
    const principalAmount = Number(principalAmountInput.value)
    const invesmentType = document.querySelector('[name="investmentType"]:checked').value


    const yearlyAmounts = new Array(bankDepositYear);

    const result = {
        totalAmount: 0,
        yearlyData: []
    }

    if(bankDepositYear < 1 ) {
        return result;
    }



    if(invesmentType === 'monthlyDeposit'){
        const monthlyAmounts = new Array(bankDepositYear*12);
        monthlyAmounts[0] = principalAmount;

        for (let index = 1; index < monthlyAmounts.length; index++) {
            const year = (index+1) / 12;
            const newInvestedAmount = year <= activeInvesmentYear ?  principalAmount : 0;

            monthlyAmounts[index] = calculateTotalWithInterest(monthlyAmounts[index-1], {
                monthlyInterest: true
            }) + newInvestedAmount;

            // recording yearly data on each 12th month
            if(year >= 1 && year % 1 === 0) {
                yearlyAmounts[year-1] = monthlyAmounts[index];
            }
        }
        result.totalAmount = monthlyAmounts[bankDepositYear*12-1];
    }else{
        yearlyAmounts[0] = calculateTotalWithInterest(principalAmount);

        for (let index = 1; index < yearlyAmounts.length; index++) {
            yearlyAmounts[index] = calculateTotalWithInterest(yearlyAmounts[index-1])
        }
        result.totalAmount = yearlyAmounts[bankDepositYear-1];
    }

    result.yearlyData = yearlyAmounts;

    return result;
    
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN').format(parseInt(amount))
}

function displayResult({totalAmount, yearlyData}) {
    const formattedAmount =  formatCurrency(totalAmount)
    output.textContent = formattedAmount;
    yearlyBreakDownList.innerHTML = yearlyData?.map((yearlyAmount, index) => `<li>After year ${index+1} : ${formatCurrency(yearlyAmount)}</li>`).join('')
    
}

function calculateAnddisplayResult() {
    const data = getTotalAmount()
    console.log("data", data)
    displayResult(getTotalAmount())    
}

principalAmountInput.addEventListener('input', calculateAnddisplayResult)
bankDepositYearInput.addEventListener('input', calculateAnddisplayResult)
activeInvestmentYearInput.addEventListener('input', calculateAnddisplayResult)
interestRateInput.addEventListener('input', calculateAnddisplayResult)

invesmentTypeInputs.forEach(radioInput => {
    radioInput.addEventListener('click', ({target}) => {
        console.log("target",target.value)
        if(target.value === 'fixedDeposit'){
            activeInvestmentYearInput.style.display = "none"
        }else {
            activeInvestmentYearInput.style.display = "inline-block"
        }
        calculateAnddisplayResult()
    })
})