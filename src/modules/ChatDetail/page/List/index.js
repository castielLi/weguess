/**
 * Created by Hsu. on 2017/8/29.
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ListView,
    FlatList,
    Image,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Modal,
} from 'react-native';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs'
import Ces from './ces';
import Types from './typeConfig';


let _listHeight = 0; //list显示高度
let _footerY = 0; //foot距离顶部距离
let scrollDistance = 0;//滚动距离

let _MaxListHeight = 0; //记录最大list高度

let FooterLayout = false;
let ListLayout = false;

const showTimeInterval = 300000


let {width, height} = Dimensions.get('window');

export default class Chat extends Component {
    constructor(props){
        super(props)
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2)=> {
            // if (r1._id !== r2._id) {
            //     console.log("不相等");
            //     console.log(r1);
            //     console.log(r2);
            // } else {
            //     console.log("相等");
            //     console.log(r1);
            //     console.log(r2);
            // }
            return r1._id !== r2._id;
        }});

        this.index = 1;
        this.data = [];
        this.data2 = [];
        this.footerY = null;
        this.listHeight = null;
        this.changeType = 1;
        this.jc = [];
        this.jc2 = [];



        this.downloadFile = this.downloadFile.bind(this);

        this.state = {
            dataSource: ds,
            dataSourceO: ds,
            showInvertible:false,
            isRefreshing:false,

            downloadDest:'',

            imageShow : false,
            imageUri : '',
        };

        this.stopSoundObj = null;
    }
    componentWillMount() {
        this.fetchData();
    }

    prepareMessages(messages) {
        //console.log(messages)
        return {
            keys: messages.map(m => m._id),
            blob: messages.reduce((o, m, i) => { //(previousValue, currentValue, currentIndex, array1)
                //console.log(o,m,i)
                //console.log(o)
                o[m._id] = {
                    ...m,
                };
                //console.log(o)
                return o;
            }, {})
        };
    }

    fetchData = () => {
        //console.log('fetchData');
        fetch('http://gank.io/api/data/福利/10/'+this.index)
            .then((response) => response.json())
            .then((responseData) => {
                let {results} = responseData;
                this.index = this.index + 1;
                this.jc = results;
                this.jc2 = results.concat().reverse()
                this.data = this.jc.slice(0);
                this.data2 = this.jc2.slice(0);
                console.log(this.data2)
                const messagesData = this.prepareMessages(this.data2);
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.data),
                    dataSourceO: this.state.dataSourceO.cloneWithRows(messagesData.blob, messagesData.keys)
                });
                //console.log(this.data);
            })
            .done();
    }
    ToCDB(str) {
        var tmp = "";
        for(var i=0;i<str.length;i++)
        {
            if(str.charCodeAt(i)>65248&&str.charCodeAt(i)<65375)
            {
                tmp += String.fromCharCode(str.charCodeAt(i)-65248);
            }
            else
            {
                tmp += String.fromCharCode(str.charCodeAt(i));
            }
        }
        return tmp
    }


    playSound = (testInfo) => {
        let one = new Date();
        //console.log('playSound1',testInfo,one)
        this.stopSound(this.stopSoundObj)
        const callback = (error, sound) => {
            console.log('playSound2')
            if(this.stopSoundObj && sound._filename == this.stopSoundObj._filename){
                this.stopSoundObj = null;
                return;
            }
            if (error) {
                Alert.alert('error', error.message);
            }
            this.stopSoundObj = sound;
            //console.log(new Date() - one)
            sound.play(() => {
                this.stopSoundObj = null;
                // Release when it's done so we're not using up resources
                sound.release();
            });
        };
        const sound = new Sound(testInfo,'', error => callback(error, sound));
    }

    stopSound = (Sound) => {
        if (!Sound) {
            return;
        }
        Sound.stop().release();
    };

    downloadFile() {
        // 图片
        //const downloadDest = `${RNFS.DocumentDirectoryPath}/${((Math.random() * 1000) | 0)}.jpg`;
        //const formUrl = 'http://img.kaiyanapp.com/c7b46c492261a7c19fa880802afe93b3.png?imageMogr2/quality/60/format/jpg';

        // 音频
        const downloadDest = `${RNFS.DocumentDirectoryPath}/${((Math.random() * 1000) | 0)}.mp3`;
         //http://wvoice.spriteapp.cn/voice/2015/0902/55e6fc6e4f7b9.mp3
        //http://www.w3school.com.cn/i/song.mp3
        //http://wvoice.spriteapp.cn/voice/2015/0818/55d2248309b09.mp3
        const formUrl = 'http://www.w3school.com.cn/i/song.mp3';

        const options = {
            fromUrl: formUrl,
            toFile: downloadDest,
            background: true,
            begin: (res) => {
                console.log('begin', res);
                console.log('contentLength:', res.contentLength / 1024 / 1024, 'M');
            },
            progress: (res) => {

                let pro = res.bytesWritten / res.contentLength;

                console.log(pro)
            }
        };
        try {
            const ret = RNFS.downloadFile(options);
            ret.promise.then(res => {
                console.log('success', res);

                console.log('file://' + downloadDest)
                this.setState({
                    downloadDest:downloadDest,
                })

            }).catch(err => {
                console.log('err', err);
            });
        }
        catch (e) {
            console.log(error);
        }

    }


    renderRow = (row,sid,rowid) => {
        console.log('执行了renderRow');
        //console.log(this.state.data.length);
        //console.log(row);
        if(row.who == 'daimajia'){
            return(
                <View style={styles.itemViewRight}>
                    <View style={styles.bubbleViewRight}>
                        <Text style={styles.contentText}>{this.ToCDB('sdfdsasd sad算daggafdg电费sdasdasd'+row.who)}</Text>
                    </View>
                    <View style={styles.bubbleViewRight}>
                        <TouchableOpacity onPress={()=>this.playSound(this.state.downloadDest)}>
                            <Text>播放</Text>
                        </TouchableOpacity>
                    </View>
                    {/*<Image source={{uri:row.url}} style={styles.userImage}/>*/}
                    {/*<Image source={require('./me.jpg')} style={styles.userImage}/>*/}
                    <Image source={{uri:'https://ws1.sinaimg.cn/large/610dc034ly1fj78mpyvubj20u011idjg.jpg'}} style={styles.userImage}/>
                </View>
            )
        }
        else{
            return(
                <View style={styles.itemView}>
                    {/*<Image source={{uri:row.url}} style={styles.userImage}/>*/}
                    {/*<Image source={require('./other.jpg')} style={styles.userImage}/>*/}
                    <Image source={{uri:'https://ws1.sinaimg.cn/large/610dc034ly1fj3w0emfcbj20u011iabm.jpg'}} style={styles.userImage}/>
                    {/*<View style={styles.bubbleView}>*/}
                        {/*<Text style={styles.contentText}>{this.ToCDB('阿萨阿达1261651 sdfdsasd sad算电费sd asdasd'+row.who)}</Text>*/}
                    {/*</View>*/}
                    <View style={{
                        alignSelf:'flex-start',
                        marginLeft:10,
                        backgroundColor: '#fff',
                        maxWidth:width-150,
                        justifyContent:'center',
                        borderRadius:5}}>
                        <TouchableOpacity onPress={()=> this.gaibian()}>
                            <Image source={{uri:'https://ws1.sinaimg.cn/large/610dc034ly1fivohbbwlqj20u011idmx.jpg'}} style={{width:100,height:100}}/>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }
    }

    gaibian(){
        this.setState({
            imageShow : true,
            imageUri:'https://ws1.sinaimg.cn/large/610dc034ly1fivohbbwlqj20u011idmx.jpg'
        },()=>console.log(this.state))

    }
    push = () => {
        //console.log('push');
        this.changeType = 1;
        this.jc.push({
            _id: "59a755a2421aa901c85e5fec",
            createdAt: "2017-08-31T08:17:38.117Z",
            desc: "8-31",
            publishedAt: "2017-08-31T08:22:07.982Z",
            source: "chrome",
            type: "\u798f\u5229",
            url: "https://ws1.sinaimg.cn/large/610dc034ly1fj2ld81qvoj20u00xm0y0.jpg",
            used: true,
            who: "发送消息发送消息发送消息发送消息发送消息发送消息发送消息发送消息发送消息发送消息发送消息发送消息"
        });
        this.jc2.unshift({
            _id: Math.round(Math.random() * 1000000),
            createdAt: "2017-08-31T08:17:38.117Z",
            desc: "8-31",
            publishedAt: "2017-08-31T08:22:07.982Z",
            source: "chrome",
            type: "\u798f\u5229",
            url: "https://ws1.sinaimg.cn/large/610dc034ly1fj2ld81qvoj20u00xm0y0.jpg",
            used: true,
            who: "发送消息发送消息发送消息发送消息发送消息发送消息发送消息发送消息发送消息发送消息发送消息发送消息"
        });
        //this.data.unshift({});
        this.data = this.jc.slice(0);
        this.data2 = this.jc2.slice(0);
        //console.log(this.data)
        const messagesData = this.prepareMessages(this.data2);
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.data),
            dataSourceO: this.state.dataSourceO.cloneWithRows(messagesData.blob, messagesData.keys)
        });
        if(this.state.showInvertible && this.changeType){
            if (this._invertibleScrollViewRef === null) { return }
            //console.log(this)
            this._invertibleScrollViewRef.scrollTo({
                y: 0,
                animated:false,
            });
        }
    }
    oldMsg = () => {
        console.log('oldMsg');
        this.changeType = 0;
        this.setState({
            isRefreshing : true
        })
        fetch('http://gank.io/api/data/福利/5/'+this.index*10)
            .then((response) => response.json())
            .then((responseData) => {
                let {results} = responseData;
                this.index = this.index + 1;
                this.jc = results.concat(this.jc)
                this.jc2 = this.jc2.concat(results)
                this.data = this.jc.slice(0);
                this.data2 = this.jc2.slice(0);
                console.log(this.data2)
                const messagesData = this.prepareMessages(this.data2);
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(this.data),
                    dataSourceO: this.state.dataSourceO.cloneWithRows(messagesData.blob, messagesData.keys),
                    isRefreshing:false
                });
                //console.log(this.data);
            })
            .done();
    }

    myRenderFooter(){
        //console.log('foot执行了')
        const {isRefreshing,showInvertible}=this.state
        if(!showInvertible) {
            return <View
                onLayout={this._onFooterLayout}
            />
        }
        else{
            return(
                <View
                    style={{alignItems:'center',justifyContent:'center',}}
                >
                    <ActivityIndicator
                        animating={isRefreshing}
                        size="small"
                        style={{height:40}}
                    />
                </View>
            )
        }
    }

    //聊天信息变化触发
    _onFooterLayout = (event) =>{
        //console.log('_onFooterLayout')
        const {showInvertible}=this.state
        if(!showInvertible) {
            //console.log(1111111111111)
            FooterLayout = event.nativeEvent.layout.y>_footerY;
            _footerY = event.nativeEvent.layout.y;

            //console.log('FooterLayout:'+FooterLayout,'_footerY:'+_footerY)

            this.scrollToBottom();

            if(_footerY>_MaxListHeight&&_MaxListHeight!==0){
                this.setState({
                    showInvertible:true
                })
            }
        }
    }

    scrollToBottom=()=> {
        if(FooterLayout === false &&ListLayout===false){
            return;
        }
        FooterLayout = false
        ListLayout=false
        if (_listHeight && _footerY && _footerY > _listHeight) {
            scrollDistance = _listHeight - _footerY;
            this.listView.scrollTo({
                y: -scrollDistance,
                x: 0,
                animated:false,
            });
        }
    }

    //界面变化触发
    _onListViewLayout = (event) =>{
        // console.log(_listHeight)

        const {showInvertible}=this.state
        if(!showInvertible){
            _MaxListHeight = event.nativeEvent.layout.height;

            ListLayout = event.nativeEvent.layout.height!==_listHeight;
            _listHeight = event.nativeEvent.layout.height;

            //console.log('_MaxListHeight:'+_MaxListHeight,'ListLayout:'+ListLayout,'_listHeight:'+_listHeight)
            this.scrollToBottom();
        }else {
            this.listView.scrollTo({
                y: 0,
                x: 0,
                animated:true,
            });
        }

    }


    render() {
        console.log('render执行了')
        //console.log(this.data)
        //console.log(this.data.concat().reverse())
        const {showInvertible}=this.state
        if(!showInvertible){
            return (
                <View style={styles.chatListView}>
                    <View style={styles.container}>
                        <Text style={styles.msg}>正</Text>
                        <View style={styles.triangle}/>
                        <TouchableOpacity onPress={this.push}>
                            <View style={{width:40,height:40,backgroundColor:'red'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.oldMsg}>
                            <View style={{width:40,height:40,backgroundColor:'blue'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.downloadFile}>
                            <View style={{width:40,height:40,backgroundColor:'black'}}/>
                        </TouchableOpacity>
                    </View>

                    <ListView
                        ref={(lv) => this.listView = lv}
                        dataSource={this.state.dataSource}
                        removeClippedSubviews={false}
                        renderRow={this.renderRow}
                        style={{paddingHorizontal:10}}

                        renderFooter={this.myRenderFooter.bind(this)}
                        onLayout={this._onListViewLayout}

                        //renderScrollComponent={props => <InvertibleScrollView {...props} inverted />}
                    />
                </View>
            );
        }else{
            return(
                <View style={styles.chatListView}>
                    <View style={styles.container}>
                        <Text style={styles.msg}>反</Text>
                        <View style={styles.triangle}/>
                        <TouchableOpacity onPress={this.push}>
                            <View style={{width:40,height:40,backgroundColor:'red'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.oldMsg}>
                            <View style={{width:40,height:40,backgroundColor:'blue'}}/>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.downloadFile}>
                            <View style={{width:40,height:40,backgroundColor:'black'}}/>
                        </TouchableOpacity>
                    </View>

                    <ListView
                        ref={(lv) => this.listView = lv}
                        dataSource={this.state.dataSourceO}
                        removeClippedSubviews={false}
                        renderRow={this.renderRow}
                        style={{paddingHorizontal:10}}

                        onEndReached={this.oldMsg}
                        onEndReachedThreshold={20}

                        renderFooter={this.myRenderFooter.bind(this)}
                        onLayout={this._onListViewLayout}

                        renderScrollComponent={props => <InvertibleScrollView ref={e => this._invertibleScrollViewRef = e} {...props} inverted />}
                    />
                    <Ces uri={this.state.imageUri} isShow={this.state.imageShow}/>
                </View>)
        }
    }
}



const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    msg: {
        fontSize: 20,
        textAlign: 'center',
        padding: 10,
        backgroundColor: '#98E165',
        borderRadius: 8,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderBottomWidth: 7,
        borderTopWidth: 7,
        borderLeftColor: '#98E165',
        borderRightColor: 'transparent',
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
    },
    chatListView:{
        backgroundColor:'#ddd',
        flex:1,
        overflow:'hidden',
    },
    itemView:{
        marginBottom:10,
        flexDirection:'row',
    },
    itemViewRight:{
        marginBottom:10,
        flexDirection:'row',
        justifyContent:'flex-end'
    },
    userImage:{
        width:40,
        height:40
    },
    bubbleView:{
        alignSelf:'flex-start',
        marginLeft:10,
        backgroundColor: '#fff',
        maxWidth:width-150,
        padding:12,
        justifyContent:'center',
        borderRadius:5
    },
    bubbleViewRight:{
        alignSelf:'flex-start',
        marginRight:10,
        backgroundColor: '#98E165',
        maxWidth:width-150,
        padding:10,
        justifyContent:'center',
        borderRadius:5
    },
    contentText:{
        includeFontPadding:false,
        fontSize:16
    }
});