// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.351
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["“每一位妇女都是主角”", "中方回应巴基斯坦向美国赠送稀土", "笑容感动全网的保洁阿姨找到了", "中国在妇女事业发展中发挥积极作用", "孩子考61分全家欢呼 爸爸否认摆拍", "法国第一夫人上法庭自证不是男人", "全网都在哼《打火机》", "男子嫌古树挡光多次投毒", "美国知名精神病学家自杀 年仅42岁", "村民把粮食晒满派出所", "广东省内夫妻将可互查对方名下财产", "北京热力辟谣代缴采暖费可打折", "两男子在邻居家食用酸汤子后1死1伤", "中方回应美方威胁对华加征100%关税", "西安连续降雨1个多月：遍地长蘑菇", "演员洛桑群培去世 享年68岁", "中方回应荷兰政府对安世半导体下手", "男子饭店吃鸡腿发现里面爬满蛆虫", "青旅回应特价房预定有年龄限制", "河南一学生带手机被要求用砖头砸烂", "董明珠称格力向特斯拉提供服务", "玄奘法师铜像长满青苔？大慈恩寺回应", "A股收盘：稀土永磁板块掀涨停潮", "多人倒戈 国民党主席改选添变数", "嘎子哥被执行超1400万 已被“限高”", "广东女生吃江西小炒被辣到送医", "男子到山东认祖 问路问到亲叔叔", "莫言称自己刷短视频也上瘾", "乒乓球亚锦赛撤下台湾地区伪旗", "今晚下调油价 加满一箱油能少花3元", "特朗普称“加沙战争已结束”", "海关查获60000张“问题地图”", "餐厅回应“丝袜奶茶”真有丝袜", "女生写生时逗牛被顶飞腰部受伤", "高铁站安检仪扫出好多“小红球”", "小红书回应“崩了”", "新疆政法委副书记刘琛任上被查", "怎么有人国庆后还有7天假", "院方回应出医院响“欢迎再次光临”", "陕西秋雨已持续39天", "美第6代隐身战斗机再生变数", "中国隐身舰载机歼-35备受关注", "全球尺度最大“海上化工厂”中国造", "老板：第一次短袖生意做了7个月", "00后小伙和父亲工地扛沙还债", "韩国皮肤科挤满特种兵医美的中国人", "特朗普以色列议会演讲遭抗议者打断", "台军方承认“海鲲”号潜艇跳票", "河南大哥假期回村3天修好泥泞土路", "首批7名以色列被扣押人员获释", "装修工转行带村里老人拍《三国》短剧"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
