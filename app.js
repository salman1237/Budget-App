        // Budget controller

var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
        this.percentage = -1
    }

    Expense.prototype.calcPercentages = function (totalInc) {
        if (totalInc>0) {
            this.percentage = Math.round((this.value / totalInc) * 100)
        }
        else {
            this.percentage = -1
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage
    }
    
    var Income = function (id, description, value) {
        this.id = id
        this.description = description
        this.value = value
    }

    var calculateTotal = function (type) {
        var sum = 0
        data.allItems[type].forEach(function (cur) {
            sum=sum+cur.value
        })
        data.totals[type] = sum
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    return {
        addItem: function (type,des,val) {
            var newItem, Id

            // create new id
            if (data.allItems[type].length > 0) {
                Id = data.allItems[type][data.allItems[type].length - 1].id + 1
            }
            else {
                Id = 0
            }
            
            
            // create new item based on inc ore exp type
            if (type==='exp') {
                newItem = new Expense(Id, des, val)
            }
            else if (type === 'inc') {
                newItem = new Income(Id, des, val)
            }

            // push into data structure 
            data.allItems[type].push(newItem)

            // return new element
            return newItem
        },
        deleteItem: function (type,id) {
            var ids= data.allItems[type].map(function (current) {
                return current.id
            })

            var index = ids.indexOf(id) 
            
            if (index !== -1) {
                data.allItems[type].splice(index,1)
            }
        },
        calculateBudget: function () {
            // calculate total income & expenses
            calculateTotal('exp')
            calculateTotal('inc')

            // calculate the budget : income-expenses
            data.budget = data.totals.inc - data.totals.exp 
            
            // calculate the percentage of income that we spent
            if (data.totals.inc>0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100)
            }
            else {
                data.percentage = -1
            }    
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentages(data.totals.inc)
            })
        },
        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (cur) {
                return cur.getPercentage()
            })
            return allPercentages
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data) 
        }
        
    }
})()

        // Ui controller

var UIController = (function () {
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer:'.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentagesLabel: '.item__percentage',
        dateLabel:'.budget__title--month'
    }

    var formatNumber= function (num, type) {
        var numSplit, int, dec, type
        

        num = Math.abs(num)
        num=num.toFixed(2)

        numSplit = num.split('.')

        int = numSplit[0]
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)
        }

        dec = numSplit[1]

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }

    return {
        getInput: function () {
            return {
            type : document.querySelector(DOMStrings.inputType).value,   //Will be inc or exp
            
            description : document.querySelector(DOMStrings.inputDescription).value,
            
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
        },
        addListItem: function (obj,type) {
            var html,newHtml,element
            // create html string with placeholder text

            if (type === 'inc') {
                element=DOMStrings.incomeContainer
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><h6> Remove</h6></button></div></div></div>'
            }
            else if (type === 'exp') {
                element = DOMStrings.expenseContainer

                html = '<div div class="item clearfix" id = "exp-%id%" ><div     class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><h6>Remove</h6></button></div></div></div >'
            }

            // replace placeholder with some actual data
            newHtml = html.replace('%id%', obj.id)
            newHtml = newHtml.replace('%description%', obj.description)
            newHtml = newHtml.replace('%value%', formatNumber(obj.value,type))
            

            // insert html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml)
        },

        deleteListItem: function (selectorId) {
            var el = document.getElementById(selectorId)
            el.parentNode.removeChild(el)
        },

        clearFields: function () {
            var fields, fieldsArr

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue)

            fieldsArr = Array.prototype.slice.call(fields)
            
            fieldsArr.forEach(function(current,index,array){
                current.value = ''
            });

            fieldsArr[0].focus()
        },
        displayBudget: function (obj) {
            var type
            obj.budget > 0 ? type = 'inc' : type = 'exp'

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type)
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc')
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp')
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = `${obj.percentage} %`
            }
            else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---'
            }
        },
        displayPercentages: function (percentage) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercentagesLabel)
            
            nodeListForEach(fields, function (current, index) {
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%'
                }
                else {
                    current.textContent ='---'
                }
            })
        },

        displayMonth: function () {
            var now = new Date()

            var months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ]
            var month=now.getMonth()
            
            var year = now.getFullYear()

            document.querySelector(DOMStrings.dateLabel).textContent=`${months[month]} ${year}`
        },

        changedType: function () {
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            )

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus')
            })

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red')
        },

        getDOMStrings: function () {
            return DOMStrings
        }
    }

})()

        // Global App controller

var controller = (function (budget, ui) {

    var setupEventListeners = function () {
        var DOM = ui.getDOMStrings()
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem)
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem()
            }
        })

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
        
        document.querySelector(DOM.inputType).addEventListener('change',ui.changedType)
    }
    var updateBudget = function () {

        // 1.calculate the budget
        budget.calculateBudget()
        // 2.return the budget
        var bud = budget.getBudget()
        
        // 3.Display Budget on ui

        ui.displayBudget(bud)
    }

    var updatePercentages = function () {
        // 1.calculate the percentages
        budget.calculatePercentages()

        // 2.read percentages from budget controller
        var percentages = budget.getPercentages()
        
        // update ui with the new percentages 
        ui.displayPercentages(percentages)
    }

    var ctrlAddItem = function () {
        var input,newItem

        // 1.Get thr field input data 

        input = ui.getInput()
        
        if (input.description!=='' && input.value!== NaN && input.value>0) {
            // 2.Add item to the budget controller

            newItem = budget.addItem(input.type, input.description, input.value)

            // 3.Add item to the ui

            ui.addListItem(newItem, input.type)

            // 4.clear the fields

            ui.clearFields()

            //5. calculate and update budget
            updateBudget()

            // 6. calculate and update percentages
            updatePercentages()
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, Id
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id
        
        if (itemId) {
            // inc-1
            splitId = itemId.split('-')
            type = splitId[0]
            Id = parseInt(splitId[1])

            // 1.delete item from data structure
            budget.deleteItem(type, Id)
            
            //2. delete items from ui
            ui.deleteListItem(itemId)

            //3. update and show new budget
            updateBudget()

            // 4. calculate and update percentages
            updatePercentages()

        }
    }

    return {
        init: function () {
            console.log('Application started');
            setupEventListeners()
            ui.displayMonth()
            ui.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            })
        }
    }
})(budgetController,UIController)

controller.init()



