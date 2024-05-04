
const principalAmountInput  = document.querySelector('#principalAmount')
const montlyDepositAmountInput  = document.querySelector('#monthlyDepositAmount')
const interestRateInput  = document.querySelector('#interestRate')
const bankDepositYearInput  = document.querySelector('#bankDepositYear')
const activeInvestmentYearInput  = document.querySelector('#activeInvestmentYear')

const invesmentTypeInputs = document.querySelectorAll('[name="investmentType"]')

const output  = document.querySelector('.output')
const yearlyBreakDownList  = document.querySelector(".yearlyBreakDown")


function calculateIterest(_principal, options) {

    // default options.yearlyInterest
    let interestRate = Number(interestRateInput.value);

    if(options?.monthlyInterest) {
        interestRate /= 12;
    }

    const interest = (_principal*interestRate) / 100;
     
    return interest;
}


function getTotalAmount() {
    const bankDepositYear = Number(bankDepositYearInput.value);
    const activeInvesmentYear = Number(activeInvestmentYearInput.value);
    const principalAmount = Number(principalAmountInput.value)
    const invesmentType = document.querySelector('[name="investmentType"]:checked').value
    const montlyDepositAmount = Number(montlyDepositAmountInput.value);
    const yearlyAmounts = new Array(bankDepositYear);

    const result = {
        totalAmount: principalAmountInput.value,
        totalInterest: 0,
        yearlyData: []
    }

    if(bankDepositYear < 1 ) {
        return result;
    }



    if(invesmentType === 'monthlyDeposit' && montlyDepositAmount){
        const monthlyAmounts = new Array(bankDepositYear*12);
        monthlyAmounts[0] = principalAmount || montlyDepositAmount;

        for (let index = 1; index < monthlyAmounts.length; index++) {
            const year = (index+1) / 12;
            const newInvestedAmount = year <= activeInvesmentYear ?  montlyDepositAmount : 0;
            const amountUntilPreviousMonth = monthlyAmounts[index-1];
            const interestOfThisMonth = calculateIterest(amountUntilPreviousMonth, {
                monthlyInterest: true
            })
            result.totalInterest += interestOfThisMonth; 
            monthlyAmounts[index] = amountUntilPreviousMonth + interestOfThisMonth + newInvestedAmount;

            // recording yearly data on each 12th month
            if(year >= 1 && year % 1 === 0) {
                yearlyAmounts[year-1] = monthlyAmounts[index];
            }
        }
        result.totalAmount = monthlyAmounts[bankDepositYear*12-1];
        result.monthlyAmounts = monthlyAmounts
    }else{
        const interestFirstThisYear = calculateIterest(principalAmount)
        yearlyAmounts[0] = principalAmount + interestFirstThisYear;
        result.totalInterest += interestFirstThisYear;

        for (let index = 1; index < yearlyAmounts.length; index++) {
            const amountUntilPreviousYear = yearlyAmounts[index-1];
            const interestOfThisYear = calculateIterest(amountUntilPreviousYear)
            result.totalInterest += interestOfThisYear;
            yearlyAmounts[index] = amountUntilPreviousYear + interestOfThisYear;
        }
        result.totalAmount = yearlyAmounts[bankDepositYear-1];
    }

    result.yearlyData = yearlyAmounts;
    return result;
    
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN').format(parseInt(amount))
}

function numbersToBdtString(number) {
    let parsedAmount = parseInt(number)
    const bdtMap = {
        Koti: 0,
        Lakh: 0,
        Hajar: 0,
        Shoto: 0,
        Tk: 0
    }

    const currencyDevision = ['Tk', 'Shoto', 'Hajar', 'Lakh', 'Koti']
    let iterrationIndex = 0;

    while(parsedAmount > 0) {
        
        const divider = iterrationIndex === 1 ? 10 :100;
        const digit = parsedAmount % divider;
        bdtMap[currencyDevision[iterrationIndex]] = digit;
        if(iterrationIndex == 4) {
            bdtMap.Koti = parsedAmount;
            parsedAmount = 0;
        }
        iterrationIndex++;
        parsedAmount= parseInt(parsedAmount/divider);

    }
    
    const fiteredAkors = Object.entries(bdtMap).filter(([, amount]) => amount)
    
    const bdtString = [...fiteredAkors].slice(0, 2).map(([akor, amount])=>`${amount} ${akor}`).join(' ')  + `${fiteredAkors.length > 2 ? '...': ''}`|| 'Zero' ;

    return bdtString

}
function displayResult({totalAmount, totalInterest, yearlyData}) {
    const formattedAmount =  formatCurrency(totalAmount)
    const formattedInterest = formatCurrency(totalInterest)
    const totalPrincipal = totalAmount-totalInterest;
    const formattedPricipal = formatCurrency(totalPrincipal)

    const outputTemplate = `
    <p> Maturity Value: ${formattedAmount} (${numbersToBdtString(totalAmount)}) </p>
    <p> Principal Amount: ${formattedPricipal} (${numbersToBdtString(totalPrincipal)})  </p>
    <p> Total Interest : ${formattedInterest} (${numbersToBdtString(totalInterest)}) </p>
    `;
    output.innerHTML = outputTemplate;

    yearlyBreakDownList.innerHTML = yearlyData?.map((yearlyAmount, index) => `<li>After year ${index+1} : ${formatCurrency(yearlyAmount)} (${numbersToBdtString(yearlyAmount)})</li>`).join('')
    
}

function calculateAndDisplayResult() {
    displayResult(getTotalAmount())    
}

principalAmountInput.addEventListener('input', calculateAndDisplayResult)
montlyDepositAmountInput.addEventListener('input', calculateAndDisplayResult)
bankDepositYearInput.addEventListener('input', ({target}) => {
    if(activeInvestmentYearInput.value > target.value) {
        activeInvestmentYearInput.value = target.value;
    }
    
    calculateAndDisplayResult()
})
activeInvestmentYearInput.addEventListener('input', ({target}) => {
    if(bankDepositYearInput.value < target.value) {
        bankDepositYearInput.value = target.value;
    }
    
    calculateAndDisplayResult()
} )
interestRateInput.addEventListener('input', calculateAndDisplayResult)

invesmentTypeInputs.forEach(radioInput => {
    radioInput.addEventListener('click', ({target}) => {
        invesmentTypeInputs.forEach(radio => radio.parentElement.classList.remove('active'))
        target.parentElement.classList.add('active')
        if(target.value === 'fixedDeposit'){
            activeInvestmentYearInput.parentElement.classList.add('d-none')
            activeInvestmentYearInput.parentElement.classList.remove('d-block')
            montlyDepositAmountInput.parentElement.classList.add('d-none')
            montlyDepositAmountInput.parentElement.classList.remove('d-block')
            principalAmountInput.parentElement.children[0].textContent = "Principal Amount";
            principalAmountInput.parentElement.children[0].placeholder = "Principal Amount"
        }else {
            principalAmountInput.parentElement.children[0].textContent = "Initial Deposit Amount (optional)"
            principalAmountInput.parentElement.children[0].placeholder = "Initial Deposit Amount"

            activeInvestmentYearInput.parentElement.classList.add('d-block')
            activeInvestmentYearInput.parentElement.classList.remove('d-none')
            montlyDepositAmountInput.parentElement.classList.add('d-block')
            montlyDepositAmountInput.parentElement.classList.remove('d-none')
        }
        calculateAndDisplayResult()
    })
})

calculateAndDisplayResult()

if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
}
