import React, {Component} from 'react';

import logo from './logo.svg';


/* This part manage URLs for requests */
const apiKeyCurrency = "0ZHUEM2KZK605UBO";
const baseUrlCurrency = "https://www.alphavantage.co/query?apikey=" + apiKeyCurrency;
const urlCurrency = baseUrlCurrency + "&function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=EUR";

const baseUrl = "https://api.iextrading.com/1.0/";

function uriQuote(symbol) {
    return baseUrl + "stock/" + encodeURI(symbol) + "/quote";
}

function uriLogo(symbol) {
    return baseUrl + "stock/" + encodeURI(symbol) + "/logo";
}

/* Button with icon component */
class Button extends Component {
    render() {
        return (
            <button className={this.props.classes} onClick={this.props.action} type={this.props.type}>
                <span>{this.props.content}<i className="material-icons">{this.props.icon}</i></span>
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
                        <label htmlFor="id_input">{this.props.label}</label>
                        <input id="id_input" type="text" className="form-control" value={this.state.value}
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
                <form onSubmit={this.handleSubmit} className="form-inline m-3">
                    <div className="form-group">
                        <label htmlFor="id_input">{this.props.labels[0]}</label>
                        <input name="value1" type={this.props.types[0]} className="form-control"
                               value={this.state.value1}
                               onChange={this.handleChange}/>
                    </div>
                    <div className="form-group ml-2">
                        <label htmlFor="id_input">{this.props.labels[1]}</label>
                        <input name="value2" type={this.props.types[0]} className="form-control"
                               value={this.state.value2}
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

class PortfolioList extends Component {
    constructor(props) {
        super(props);

        this.state = {portfolios: [], currencyRate: 0};

        this.addPortfolio = this.addPortfolio.bind(this);
        this.removePortfolio = this.removePortfolio.bind(this);
        this.addStock = this.addStock.bind(this);
        this.removeStock = this.removeStock.bind(this);
        this.changeCurrency = this.changeCurrency.bind(this);
        this.addCheckedStock = this.addCheckedStock.bind(this);
        this.getCurrencyExchangeRate = this.getCurrencyExchangeRate.bind(this);
    }

    addPortfolio(name) {
        let portfolios = this.state.portfolios;
        let nameAlreadyUsed = false;
        portfolios.forEach(function (portfolio) {
            if (portfolio.name === name) {
                nameAlreadyUsed = true;
            }
        });
        if (portfolios.length >= 10)
            alert('You cannot have more than 10 portfolios.');
        else if (name.length < 1)
            alert('Please choose a name.');
        else if (nameAlreadyUsed)
            alert('This portfolio name is already used.');
        else
            portfolios.push({name: name, stocks: [], currency: "EUR"});
        this.setState({portfolios: portfolios});
    }

    removePortfolio(portfolioName) {
        let portfolios = this.state.portfolios;
        portfolios.forEach(function (portfolio, index) {
            if (portfolio.name === portfolioName) {
                portfolios.splice(index, 1);
            }
        });
        this.setState({portfolios: portfolios});
    }

    addStock(portfolioName, stock) {
        stock.symbol = stock.symbol.toUpperCase();
        let portfolios = this.state.portfolios;
        if (stock.symbol.length < 1) // TODO: Which sizes allowed?
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
        portfolios.forEach(function (portfolio) {
            if (portfolio.name === portfolioName) {
                if (portfolio.stocks.length >= 50)
                    alert('You cannot have more than 10 portfolios.');
                else {
                    let symbolAlreadyAdded = false;
                    portfolio.stocks.forEach(function (stk) {
                        if (stk.symbol === stock.symbol) {
                            symbolAlreadyAdded = true;
                        }
                    });
                    if (symbolAlreadyAdded)
                        alert('This symbol is already added.');
                    else
                        portfolio.stocks.push(stock);
                }
            }
        });
        this.setState({portfolios: portfolios});
    }

    removeStock(portfolioName, stockSymbol) {
        let portfolios = this.state.portfolios;
        portfolios.forEach(function (portfolio) {
            if (portfolio.name === portfolioName) {
                portfolios.stocks.forEach(function (stock, index) {
                    if (stock.symbol === stockSymbol) {
                        portfolios.stocks.splice(index, 1);
                    }
                });
            }
        });
        this.setState({portfolios: portfolios});
    }

    // This method change the currency of a portfolio and keep it in its state
    changeCurrency(portfolioName) {
        let portfolios = this.state.portfolios;
        portfolios.forEach(function (portfolio) {
            if (portfolio.name === portfolioName) {
                if (portfolio.currency === "EUR")
                    portfolio.currency = "USD";
                else {
                    portfolio.currency = "EUR";
                }
            }
        });
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

    componentDidMount() {
        this.getCurrencyExchangeRate();

        // Load portfolios from local storage
        let portfoliosFromStorage = JSON.parse(localStorage.getItem("portfolios"));
        if (typeof portfoliosFromStorage === 'undefined' || portfoliosFromStorage === null)
            portfoliosFromStorage = [];
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
        let listPortfolios = this.state.portfolios.map((portfolio) =>
            <Portfolio key={portfolio.name}
                       name={portfolio.name}
                       stocks={portfolio.stocks}
                       currency={portfolio.currency}
                       currencyRate={this.state.currencyRate}
                       removePortfolio={this.removePortfolio}
                       addStock={this.addStock}
                       removeStock={this.removeStock}
                       changeCurrency={this.changeCurrency}/>);

        return (
            <div>
                <div className="centered">
                    <h1 className="mt-3">Your Portfolios</h1>
                    <SingleInputForm onSubmit={this.addPortfolio}
                                     label={"Portfolio Name:"}
                                     buttonContent={"Add new Portfolio"}
                                     buttonClass={"myBtn-dark"}/>
                </div>

                {listPortfolios}

            </div>
        );
    }
}

class Portfolio extends Component {
    constructor(props) {
        super(props);

        this.callAddStock = this.callAddStock.bind(this);
        this.callChangeCurrency = this.callChangeCurrency.bind(this);
    }

    callAddStock(state) {
        let stock = {symbol: state.value1, shares: state.value2};
        this.props.addStock(this.props.name, stock);
    }

    callChangeCurrency() {
        this.props.changeCurrency(this.props.name);
    }

    render() {
        let listStocks = this.props.stocks.map((stock) =>
            <Stock key={stock.symbol}
                   symbol={stock.symbol}
                   shares={stock.shares}
                   currency={this.props.currency}
                   removeStock={this.props.removeStock}
                   currencyRate={this.props.currencyRate}
            />);

        return (
            <div className="portfolio">
                <div className="row">
                    <div className="col-8">
                        <h1>{this.props.name}</h1>
                    </div>
                    <div className="col-4">
                        <Switch currency={this.props.currency}
                                changeCurrency={this.callChangeCurrency}/>
                    </div>
                </div>
                <DoubleInputForm onSubmit={this.callAddStock}
                                 types={["text", "number"]}
                                 labels={["Stock Symbol:", "Number of shares:"]}
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
                    <Button classes={"myBtn-light"} content={"Remove Portfolio"} icon={"delete_outline"}
                            action={this.props.removePortfolio.bind(this, this.props.name)}/>
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
        //this.callAddStock = this.callAddStock.bind(this);
    }

    componentDidMount() {
        // let url = baseUrl + "&function=TIME_SERIES_INTRADAY&interval=5min&symbol=" + encodeURI(this.props.symbol);
        // let url = baseUrl + "&function=GLOBAL_QUOTE&symbol=" + encodeURI(this.props.symbol);
        /*let url = baseUrl + "stock/market/batch?types=quote&symbols=" + encodeURI(this.props.symbol);
        let url_logo = baseUrl + "stock/" + encodeURI(this.props.symbol) + "/logo";*/

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
        if (this.state.isLoaded && this.state.logoLoaded && this.props.currencyRate > 0) {
            elementLoaded =
                <tr>
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
/*
class Chart extends Component {
    render() {
        return (

        );
    }
}
*/
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

class App extends Component {
    render() {
        return (
            <div className="App">
                <header className="header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <p>
                        Welcome on the <span className="accentuated">Stock Portfolio Management System</span>.
                    </p>
                </header>
                <main>
                    <div className="container">
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
