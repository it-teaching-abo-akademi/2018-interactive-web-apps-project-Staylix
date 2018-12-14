import React, {Component} from 'react';
import {Line} from 'react-chartjs-2';


/* This part manage URLs for requests */
const apiKeyCurrency = "0ZHUEM2KZK605UBO";
const baseUrlCurrency = "https://www.alphavantage.co/query?apikey=" + apiKeyCurrency;
const urlCurrency = baseUrlCurrency + "&function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR";

const baseUrl = "https://api.iextrading.com/1.0/";

function uriQuote(symbol) {
    return baseUrl + "stock/" + encodeURI(symbol) + "/quote";
}

function uriChart(symbolList, range) {
    let symbols = "";
    const intervalByRange = {"1d": "4", "1m": "1", "3m": "2", "6m": "3", "ytd": "4", "1y": "6", "2y": "9", "5y": "16"};
    let interval = intervalByRange[range];
    for (let i = 0; i < symbolList.length; i++) {
        if (i > 0)
            symbols += ',';
        symbols += symbolList[i].symbol;
    }
    let url = baseUrl + "stock/market/batch?types=chart&symbols=" + encodeURI(symbols);
    return url + "&range=" + range + "&chartInterval=" + interval;
}

function uriLogo(symbol) {
    return baseUrl + "stock/" + encodeURI(symbol) + "/logo";
}

/* The color palette for charts */
const colors = ["#537c8e", "#2ebdbd", "#ceae7f", "#85583f", "#847370", "#de9396", "#b94a59", "#6a0a29", "#423c6d", "#7a839e", "#94b5c2", "#eadcc1"];
const colorsBackground = ["#537c8e44", "#2ebdbd44", "#ceae7f44", "#85583f44", "#84737044", "#de939644", "#b94a5944", "#6a0a2944", "#423c6d44", "#7a839e44", "#94b5c244", "#eadcc144"];

/* Button with icon component */
class Button extends Component {
    render() {
        return (
            <button className={this.props.classes} onClick={this.props.action} type={this.props.type}>
                <span><b>{this.props.content}</b><i className="material-icons">{this.props.icon}</i></span>
            </button>
        );
    }
}

class Loader extends Component {
    render() {
        return (
            <div className="lds-ellipsis">
                <div/>
                <div/>
                <div/>
                <div/>
            </div>
        );
    }
}

class SingleInputForm extends Component {
    constructor(props) {
        super(props);
        this.state = {value: ""};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        this.props.onSubmit(this.state.value);
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit} className="form-inline">
                    <div className="form-group">
                        <label htmlFor="id_input" className="mr-2">{this.props.label}</label>
                        <input id="id_input" type="text" className="form-control mr-2" value={this.state.value}
                               onChange={this.handleChange}/>
                    </div>
                    <Button classes={this.props.buttonClass} content={this.props.buttonContent}
                            icon={"add_circle_outline"}
                            type={"submit"}/>
                </form>
            </div>
        );
    }
}

class DoubleInputForm extends Component {
    constructor(props) {
        super(props);
        this.state = {value1: "", value2: ""};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        let state = this.state;
        state[event.target.name] = event.target.value;
        this.setState(state);
    }

    handleSubmit(event) {
        this.props.onSubmit(this.state);
        event.preventDefault();
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit} className="my-3">
                    <div className="form-group row">
                        <label htmlFor="value1" className="col-md-3 col-form-label">{this.props.labels[0]}</label>
                        <div className="col-md-9">
                            <input id="value1" name="value1" type={this.props.types[0]} className="form-control"
                                   value={this.state.value1}
                                   onChange={this.handleChange}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="value2" className="col-md-3 col-form-label">{this.props.labels[1]}</label>
                        <div className="col-md-9">
                            <input id="value2" name="value2" type={this.props.types[0]} className="form-control"
                               value={this.state.value2}
                               onChange={this.handleChange}/>
                        </div>
                    </div>
                    <Button classes={this.props.buttonClass} content={this.props.buttonContent}
                            icon={"add_circle_outline"}
                            type={"submit"}/>
                </form>
            </div>
        );
    }
}

class PortfolioList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            portfolios: {},
            currencyRate: 0,
            showChart: false,
            stocksChart: [],
            labelsChart: [],
            datasetsChart: [],
            range: "1d",
        };

        this.addPortfolio = this.addPortfolio.bind(this);
        this.removePortfolio = this.removePortfolio.bind(this);
        this.addStock = this.addStock.bind(this);
        this.removeSelectedStocks = this.removeSelectedStocks.bind(this);
        this.changeCurrency = this.changeCurrency.bind(this);
        this.addCheckedStock = this.addCheckedStock.bind(this);
        this.getCurrencyExchangeRate = this.getCurrencyExchangeRate.bind(this);
        this.changeSelectState = this.changeSelectState.bind(this);
        this.showChart = this.showChart.bind(this);
        this.hideModal = this.hideModal.bind(this);
        this.changeRange = this.changeRange.bind(this);
    }

    addPortfolio(name) {
        let portfolios = this.state.portfolios;
        if (portfolios.length >= 10)
            alert('You cannot have more than 10 portfolios.');
        else if (name.length < 1)
            alert('Please choose a name.');
        else if (name in portfolios)
            alert('This portfolio name is already used.');
        else {
            portfolios[name] = {name: name, stocks: [], currency: "EUR"};
        }
        this.setState({portfolios: portfolios});
    }

    removePortfolio(portfolioName) {
        let portfolios = this.state.portfolios;
        delete portfolios[portfolioName];
        this.setState({portfolios: portfolios});
    }

    addStock(portfolioName, stock) {
        stock.symbol = stock.symbol.toUpperCase();
        let portfolios = this.state.portfolios;
        if (stock.symbol.length < 1)
            alert('Please give the stock symbol.');
        else if (stock.shares < 1)
            alert('Please add at least 1 share.');
        else {
            let url = uriQuote(stock.symbol);
            fetch(url)
                .then(res => res.json())
                .then(
                    (result) => {
                        if (result === {})
                            alert('Unknown symbol.');
                        else {
                            this.addCheckedStock(portfolios, portfolioName, stock);
                        }
                    },
                    (error) => {
                        alert('Unknown symbol. Error: ' + error);
                    }
                );
        }
    }

    // This function is called only if the symbol is validated.
    addCheckedStock(portfolios, portfolioName, stock) {
        if (portfolios[portfolioName].stocks.length >= 50)
            alert('You cannot have more than 50 stocks.');
        else {
            let symbolAlreadyAdded = false;
            portfolios[portfolioName].stocks.forEach(function (stk) {
                if (stk.symbol === stock.symbol) {
                    symbolAlreadyAdded = true;
                }
            });
            if (symbolAlreadyAdded)
                alert('This symbol is already added.');
            else
                portfolios[portfolioName].stocks.push(stock);
        }
        this.setState({portfolios: portfolios});
    }

    // Remove all the selected stocks on the passed portfolio
    removeSelectedStocks(portfolioName) {
        let portfolios = this.state.portfolios;
        portfolios[portfolioName].stocks.forEach(function (stock, index) {
            if (stock.selected) {
                portfolios[portfolioName].stocks.splice(index, 1);
            }
        });
        this.setState({portfolios: portfolios});
    }

    changeSelectState(portfolioName, stockSymbol) {
        let portfolios = this.state.portfolios;
        portfolios[portfolioName].stocks.forEach(function (stock) {
            if (stock.symbol === stockSymbol) {
                stock.selected = !stock.selected;
            }
        });
        this.setState({portfolios: portfolios});
    }

    // This method change the currency of a portfolio and keep it in its state
    changeCurrency(portfolioName) {
        let portfolios = this.state.portfolios;
        if (portfolios[portfolioName].currency === "EUR")
            portfolios[portfolioName].currency = "USD";
        else {
            portfolios[portfolioName].currency = "EUR";
        }
        this.setState({portfolios: portfolios});
    }

    // This method call the api to know the currency rate to switch from USD to EUR
    getCurrencyExchangeRate() {
        fetch(urlCurrency)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        currencyRate: result['Realtime Currency Exchange Rate']['5. Exchange Rate']
                    });
                },
                (error) => {
                    this.setState({
                        currencyRate: 0,
                        error
                    });
                }
            );
    }

    // To show the modal with the chart
    showChart(portfolioName, range = null) {
        if (typeof range === "object")
            range = this.state.range;
        let stocks = this.state.portfolios[portfolioName].stocks.filter(stock => stock.selected);
        if (stocks.length < 1) {
            alert("Select at least one stock.");
            return;
        }
        this.setState({
            showChart: true,
            stocksChart: stocks,
            lastPortfolio: portfolioName
        });
        let labels = [];
        let datasets = [];
        let url = uriChart(stocks, range);
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result === {})
                        alert('Impossible to fetch data.');
                    else {
                        labels = Object.values(Object.values(result)[0].chart).map((value) => {
                            return (value.label)
                        });
                        for (let key in Object.keys(result)) {
                            let symbol = Object.keys(result)[key]; // Don't understand why, but it works
                            let data = Object.values(result[symbol].chart).map((value) => {
                                return (value.close)
                            });
                            let colorNumber = Math.floor(Math.random() * colors.length);
                            datasets.push({
                                label: symbol,
                                data: data,
                                borderColor: colors[colorNumber],
                                backgroundColor: colorsBackground[colorNumber],
                                spanGaps: true
                            })
                        }
                        this.setState({
                            labelsChart: labels,
                            datasetsChart: datasets
                        });
                    }
                }
                ,
                (error) => {
                    alert('Impossible to fetch data.');
                    this.setState({
                        error
                    });
                }
            );
    }

    // To hide the modal
    hideModal() {
        this.setState({showChart: false})
    }

    // To change the range of the chart (called from the switcher in the modal)
    changeRange(range) {
        this.setState({range: range});
        this.showChart(this.state.lastPortfolio, range);
    }

    componentDidMount() {
        // We call this function only at the loading of the page, to get the exchange rate between EUR and USD
        this.getCurrencyExchangeRate();

        // Load portfolios from local storage
        let portfoliosFromStorage = JSON.parse(localStorage.getItem("portfolios"));
        if (typeof portfoliosFromStorage === 'undefined' || portfoliosFromStorage === null)
            portfoliosFromStorage = {};
        this.setState({portfolios: portfoliosFromStorage});

        window.addEventListener(
            "beforeunload",
            this.saveStateToLocalStorage.bind(this)
        );
    }

    componentWillUnmount() {
        window.removeEventListener(
            "beforeunload",
            this.saveStateToLocalStorage.bind(this)
        );

        // saves if component has a chance to unmount
        this.saveStateToLocalStorage();
    }

    saveStateToLocalStorage() {
        (localStorage.setItem("portfolios", JSON.stringify(this.state.portfolios)));
    }

    render() {
        let keys = Object.keys(this.state.portfolios);
        let portfolios = this.state.portfolios;
        let listPortfolios = keys.map((portfolioName) =>
            <Portfolio key={portfolios[portfolioName].name}
                       name={portfolios[portfolioName].name}
                       stocks={portfolios[portfolioName].stocks}
                       currency={portfolios[portfolioName].currency}
                       currencyRate={this.state.currencyRate}
                       removePortfolio={this.removePortfolio}
                       addStock={this.addStock}
                       removeSelectedStocks={this.removeSelectedStocks}
                       changeCurrency={this.changeCurrency}
                       changeSelectState={this.changeSelectState}
                       showChart={this.showChart}
            />);
        if (listPortfolios.length > 1) {
            let leftPortfolios = [];
            let rightPortfolios = [];
            for (let i = 0; i < listPortfolios.length; ++i) {
                if (i % 2 === 0)
                    leftPortfolios.unshift(listPortfolios[i]);
                else
                    rightPortfolios.unshift(listPortfolios[i]);
            }
            listPortfolios =
                <div className="row">
                    <div className="col-12 col-lg-6 px-3">
                        {leftPortfolios}
                    </div>
                    <div className="col-12 col-lg-6 px-3">
                        {rightPortfolios}
                    </div>
                </div>;
        }
        return (
            <div>
                <div className="centered">
                    <h1 className="mt-3">Your Portfolios</h1>
                    <SingleInputForm onSubmit={this.addPortfolio}
                                     label={"Portfolio Name"}
                                     buttonContent={"Add new Portfolio"}
                                     buttonClass={"myBtn-dark"}/>
                </div>
                <Modal hideModal={this.hideModal}
                       labels={this.state.labelsChart}
                       datasets={this.state.datasetsChart}
                       shown={this.state.showChart}
                       changeRange={this.changeRange}
                       range={this.state.range}
                />

                <div className="mt-4">
                    {listPortfolios}
                </div>
            </div>
        );
    }
}

class Portfolio extends Component {
    constructor(props) {
        super(props);

        this.callAddStock = this.callAddStock.bind(this);
        this.callChangeCurrency = this.callChangeCurrency.bind(this);
        this.callChangeSelectState = this.callChangeSelectState.bind(this);
    }

    callAddStock(state) {
        let stock = {symbol: state.value1, shares: state.value2};
        this.props.addStock(this.props.name, stock);
    }

    callChangeCurrency() {
        this.props.changeCurrency(this.props.name);
    }

    callChangeSelectState(stockSymbol) {
        this.props.changeSelectState(this.props.name, stockSymbol)
    }

    render() {
        let listStocks = this.props.stocks.map((stock) =>
            <Stock key={stock.symbol}
                   symbol={stock.symbol}
                   shares={stock.shares}
                   selected={stock.selected}
                   currency={this.props.currency}
                   currencyRate={this.props.currencyRate}
                   changeSelectState={this.callChangeSelectState}
            />);

        return (
            <div className="portfolio mb-4 animated fadeIn slow">
                <div className="row">
                    <div className="col-8">
                        <h1>{this.props.name}</h1>
                        <Button classes={"myBtn-light"} content={"Remove Portfolio"} icon={"delete_outline"}
                                action={this.props.removePortfolio.bind(this, this.props.name)}/>
                    </div>
                    <div className="col-4">
                        <Switch currency={this.props.currency}
                                changeCurrency={this.callChangeCurrency}/>
                    </div>
                </div>
                <DoubleInputForm onSubmit={this.callAddStock}
                                 types={["text", "number"]}
                                 labels={["Stock Symbol", "Number of shares"]}
                                 buttonContent={"Add stock"}
                                 buttonClass={"myBtn-light"}/>

                <table className="table">
                    <thead>
                    <tr>
                        <th scope="col">Symbol</th>
                        <th scope="col">Unit value</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Total value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {listStocks}
                    </tbody>
                </table>
                <div className="centered">
                    <Button classes={"myBtn-light"} content={"Remove Selected Stocks"} icon={"delete_outline"}
                            action={this.props.removeSelectedStocks.bind(this, this.props.name)}/>
                    <Button classes={"myBtn-light"} content={"Show Chart"} icon={"insert_chart_outlined"}
                            action={this.props.showChart.bind(this, this.props.name)}/>
                </div>
            </div>
        );
    }
}

class Modal extends Component {
    render() {
        const texts = ["1d", "1m", "3m", "6m", "ytd", "1y", "2y", "5y"];
        const titles = ["One day", "One month", "Three months", "Six months", "Year-to-date", "One year", "Two years", "Five years"];

        let data = {
            labels: this.props.labels,
            datasets: this.props.datasets
        };
        let options = {}; //{scales: {yAxes: [{ticks: {beginAtZero: true}}]}};
        return (
            <div className={this.props.shown ? "modal" : "modal hide"}>
                <div className="modal-content">
                    <div>
                        <i className="material-icons" onClick={this.props.hideModal}>cancel</i>
                    </div>
                    <Line data={data} options={options}/>
                    <div className="centered">
                        <SwitchMultiple
                            texts={texts}
                            titles={titles}
                            changeSelected={this.props.changeRange}
                            selectedText={this.props.range}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

class Logo extends Component {
    render() {
        return (
            <img className="logo" src={this.props.src} alt=""/>
        );
    }
}

class Stock extends Component {
    constructor(props) {
        super(props);

        this.state = {
            error: null,
            isLoaded: false,
            logoLoaded: false,
            price: 0
        };
    }

    componentDidMount() {
        let url = uriQuote(this.props.symbol);
        let url_logo = uriLogo(this.props.symbol);

        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result === {})
                        alert('Unknown symbol.');
                    else {
                        this.setState({
                            isLoaded: true,
                            price: result['latestPrice']
                        });
                    }
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            );
        fetch(url_logo)
            .then(res => res.json())
            .then(
                (result) => {
                    if (result === {})
                        alert("Unknown symbol's logo.");
                    else {
                        this.setState({
                            logoLoaded: true,
                            logo: result["url"]
                        });
                    }
                },
                (error) => {
                    this.setState({
                        logoLoaded: true,
                        error
                    });
                }
            );
    }

    render() {
        let elementLoaded, price;
        let currency = this.props.currency;
        if (currency == null)
            currency = "USD";
        if (currency === "EUR") {
            price = this.state.price * this.props.currencyRate;
        } else {
            price = this.state.price
        }
        const isSelected = this.props.selected;
        if (this.state.isLoaded && this.state.logoLoaded && this.props.currencyRate > 0) {
            elementLoaded =
                <tr className={isSelected ? "selected" : ""}
                    onClick={this.props.changeSelectState.bind(this, this.props.symbol)}>
                    <th scope="row"><Logo src={this.state.logo}/>{this.props.symbol}</th>
                    <td>{new Intl.NumberFormat('fi-FI', {
                        style: 'currency',
                        currency: currency
                    }).format(price)}</td>
                    <td>{this.props.shares}</td>
                    <td>{new Intl.NumberFormat('fi-FI', {
                        style: 'currency',
                        currency: currency
                    }).format(price * this.props.shares)}</td>
                </tr>
        } else {
            elementLoaded =
                <tr>
                    <th scope="row">{this.props.symbol}</th>
                    <td>
                        <Loader/>
                    </td>
                    <td>{this.props.shares}</td>
                    <td>
                        <Loader/>
                    </td>
                </tr>
        }

        return (
            elementLoaded
        );
    }
}

class Switch extends Component {
    constructor(props) {
        super(props);

        this.clickHandler = this.clickHandler.bind(this);
    }

    clickHandler() {
        this.props.changeCurrency();
    }

    render() {
        let leftSwitch;
        let rightSwitch;

        if (this.props.currency === "EUR") {
            leftSwitch = "switchActive";
            rightSwitch = "switchDisabled";
        } else {
            rightSwitch = "switchActive";
            leftSwitch = "switchDisabled";
        }

        return (
            <div className="switch" onClick={this.clickHandler}>
                <div className={leftSwitch}><i className="material-icons">euro_symbol</i></div>
                <div className={rightSwitch}><i className="material-icons">attach_money</i></div>
            </div>
        );
    }
}

class SwitchMultiple extends Component {
    render() {
        let className;
        let buttons = [];
        for (let i = 0; i < this.props.texts.length; i++) {
            if (this.props.selectedText === this.props.texts[i])
                className = "switchActive";
            else
                className = "switchDisabled";
            buttons.push(
                <SwitchItem
                    key={this.props.texts[i]}
                    text={this.props.texts[i]}
                    className={className}
                    icon={this.props.icons !== undefined ? this.props.icons[i] : null}
                    title={this.props.titles !== undefined ? this.props.titles[i] : null}
                    clickHandler={this.props.changeSelected}
                />
            )
        }
        return (
            <div className="switch-multiple mt-3">
                {buttons}
            </div>
        );
    }
}

class SwitchItem extends Component {
    render() {
        let content;
        if (this.props.icon === null)
            content = this.props.text;
        else
            content = <i className="material-icons">this.props.icon</i>;
        return (
            <div
                {...(this.props.title !== null ? {title: this.props.title} : {})}
                className={this.props.className}
                onClick={this.props.clickHandler.bind(this, this.props.text)}
            >
                {content}
            </div>
        );
    }
}

class App extends Component {
    render() {
        return (
            <div className="App">
{/*                <header className="header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <p>
                        Welcome on the <span className="accentuated">Stock Portfolio Management System</span>.
                    </p>

                </header>*/}
                <div className="parallax">
                    <a href="#main"><i className="material-icons">expand_more</i></a>
                    <header className="header">
                        <h1>Welcome on the <span className="accentuated">Stock Portfolio Management System</span>.</h1>
                    </header>
                </div>

                <main>
                    <div className="container" id="main">
                        <PortfolioList/>
                    </div>
                </main>

                <footer className="footer">
                    Data provided for free by <a href="https://iextrading.com/developer">IEX</a>. View <a
                    href="https://iextrading.com/api-exhibit-a/">IEX’s Terms of Use</a>.
                </footer>
            </div>
        );
    }
}

export default App;
