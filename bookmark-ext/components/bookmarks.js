/*global chrome*/
import React, { Component } from 'react';
import {debounce} from 'throttle-debounce';
import './bookmarks.css';

const getLang = () => {
    if (navigator.languages !== undefined)
        return navigator.languages[0];
    else
        return navigator.language;
};

let toastElement = null;
let container = null;
let navTop = null;

class Bookmarks extends Component {
    state = {
        oldBookmarks: [],
        bookmarks: [],
        toastMessage: null,
        headerClass: '',
        loading: true,
        searchOn: false
    };

    getItemWithFavicon = (item) => {
        const lang = getLang();
        const faviconData = item.url.split('/');

        return {
            ...item,
            date: new Date(item.dateAdded).toLocaleDateString(lang),
            favicon: 'https://www.google.com/s2/favicons?domain=' + faviconData[2]
        };
    };

    getFlattenedData = (data) => {
        let results = [];
        data.forEach((item) => {
            if(item.hasOwnProperty('children')) {
                const items = item.children.map((d) => {
                    return this.getItemWithFavicon(d);
                });
                results.push(...items);
            } else {
                results.push(this.getItemWithFavicon(item));
            }
        });

        return results;
    };

    componentDidMount() {
        chrome.bookmarks.getTree((bookmarks) => {
            let savedBookmarks = bookmarks[0].children[0].children;
            savedBookmarks = this.getFlattenedData(savedBookmarks);
            savedBookmarks.sort(function (a, b) {
                //oldest first
                // return a.dateAdded - b.dateAdded;
                //latest first
                return b.dateAdded - a.dateAdded;
            });
            this.setState({
                bookmarks: savedBookmarks,
                oldBookmarks: savedBookmarks,
                loading: false
            });
        });
        chrome.bookmarks.onCreated.addListener(this.onBookMarkCreated);
        chrome.bookmarks.onRemoved.addListener(this.onBookMarkRemoved);
        window.addEventListener('scroll', this.handleScroll);
        toastElement = document.getElementById("toast");
        container = document.getElementById('bookmark-container');
        navTop = document.getElementById("myBtn");
        // When the user scrolls down 20px from the top of the document, show the button
        window.onscroll = () => this.scrollFunction();
    }

     scrollFunction = () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            navTop.style.display = "block";
        } else {
            navTop.style.display = "none";
        }
     };

    // When the user clicks on the button, scroll to the top of the document
    topFunction = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    onBookMarkCreated = (id, bookmark) => {
        const {bookmarks, oldBookmarks} = this.state;
        bookmark = this.getItemWithFavicon(bookmark);
        const newBookmarks = [
            bookmark,
            ...bookmarks,
        ];
        this.setState({
            bookmarks: newBookmarks,
            oldBookmarks: [
                bookmark,
                ...oldBookmarks,
            ],
            toastMessage: 'A new bookmark has been added'
        });
        toastElement.className = 'show';
        setTimeout(() => {
            toastElement.className = toastElement.className.replace('show', '');
            this.setState({toastMessage: null});
        }, 3000);
    };

    onBookMarkRemoved = (parentId, node) => {
        const {bookmarks, oldBookmarks} = this.state;
        const deletedIndex = bookmarks.findIndex(bookmark => bookmark.id === node.node.id);
        const deletedIndexFromOld = oldBookmarks.findIndex(bookmark => bookmark.id === node.node.id);
        bookmarks.splice(deletedIndex, 1);
        oldBookmarks.splice(deletedIndexFromOld, 1);
        this.setState({
            bookmarks: [
                ...bookmarks
            ],
            oldBookmarks: [
                ...oldBookmarks
            ],
            toastMessage: 'A bookmark has been removed.'
        });
        toastElement.className = 'show';
        setTimeout(() => {
            toastElement.className = toastElement.className.replace('show', '');
            this.setState({toastMessage: null});
        }, 3000);
    };

    handleScroll = () => {
        let headerClass = 'content-header-resize-big';
        if (window.scrollY > 29) {
            headerClass = 'fixed-header-overlay content-header-resize-small';
        }
        this.setState({headerClass});
    };

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    };

    deleteBookMark = (item) => {
        const {bookmarks, oldBookmarks} = this.state;
        container.className = 'bookmark-container disabled-view';
        const toastMessage = `Successfully Removed --- ${item.title.substring(0, 100)} `;
        this.setState({toastMessage});
        chrome.bookmarks.remove(item.id,  () => {
            toastElement.className = 'show';
            setTimeout(() => {
                toastElement.className = toastElement.className.replace('show', '');
                container.className = container.className.replace('disabled-view', '');
                const deletedIndex = bookmarks.findIndex(bookmark => bookmark.id === item.id);
                bookmarks.splice(deletedIndex, 1);
                oldBookmarks.splice(deletedIndex, 1);
                this.setState({bookmarks, toastMessage: null, oldBookmarks: oldBookmarks});
            }, 5000);
        });
    };

    openBookMark = (item) => {
        window.open(
            item.url,
            "_blank",
        );
    };

    searchChange = (e) => {
        this.setState({loading: true});
        const {oldBookmarks} = this.state;
        e.persist();
        debounce(600, () => {
            const searchString = e.target.value;
            if (searchString === '') {
                this.setState({
                    bookmarks: oldBookmarks,
                    loading: false,
                    searchOn: false
                });
                return;
            }
            const searchedResults = oldBookmarks.filter(item => {
                return item.title.toLowerCase().includes(searchString.toLowerCase());
            });
            this.setState({
                bookmarks: searchedResults,
                loading: false,
                searchOn: true
            });
        })();
    };

    render() {
        const {
            toastMessage, headerClass,
            bookmarks, loading, searchOn
        } = this.state;
        return (
            <div className='bookmark-wrapper'>
                <div className={`content-header ${headerClass}`}>
                    <label>Bookmarks</label>
                    <div className="search-container">
                        <input
                            type="text" placeholder="Search.."
                            name="search"
                            onChange={this.searchChange}
                        />
                    </div>
                    <div onClick={this.topFunction} id="myBtn" title="Back To Top">
                      <img src="/static/arrow.jpg" className='scroll-img'/>
                    </div>
                </div>
                <div className='bookmark-container' id='bookmark-container'>
                    {
                        bookmarks.length > 0 ?
                            bookmarks.map(item => {
                                return (
                                    <div className='bookmark-item' key={item.id}>
                                        <div className='bookmark-title'>
                                            <div className='float-left'>
                                                <img src={item.favicon} className='fav-img'/>
                                            </div>
                                            <div className='label-margin'>
                                                {
                                                    item.title.length <= 200 ?
                                                        item.title : item.title.substring(0, 200) + '...'
                                                }
                                            </div>
                                        </div>
                                        <div className='bookmark-url'>
                                            <span>URl -- </span>
                                            <a onClick={() => this.openBookMark(item)}>
                                                {
                                                    item.url.length <= 200 ?
                                                        item.url : item.url.substring(0, 200) + '...'
                                                }
                                            </a>
                                        </div>
                                        <div className='bookmark-url'>
                                            <span>Date Added -- </span> {item.date}

                                        </div>
                                        <div className='delete-icon-wrapper'>
                                            <img
                                                onClick={() => this.deleteBookMark(item)}
                                                src='/static/images.png'
                                                className='delete-icon'
                                            />
                                        </div>
                                    </div>
                                )
                            }) :
                            <div className='bookmark-empty'>
                                {
                                    loading && !searchOn ?
                                        <div className='loading-state'>
                                            <div className='loader'></div>
                                        </div> :
                                        <div className='empty-state'>
                                            <label>
                                                No Bookmarks Found
                                            </label>
                                        </div>
                                }
                            </div>
                    }
                </div>
                <div id="toast">
                    <div id="desc">{toastMessage}</div>
                </div>
            </div>
        )
    }
}

export default Bookmarks
