// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.87
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
var default_search_words = ["我们的名字叫“长江”", "台湾旅行团整团被卖到缅甸", "未来5年地球将遇“致命高温”", "央行多措并举 6月流动性整体无虞", "郑钦文不敌萨巴伦卡止步法网8强", "乌克兰袭击克里米亚大桥 画面曝光", "吴京的车又翻了", "韩国总统选举投票结束", "27岁女游客在三亚被蛇咬伤身亡", "2025年高考举报电话已开通", "51岁董卿现身儿子学校 母子罕见同框", "高考前吃素能提高智商？谣言", "三亚女游客被蛇咬伤身亡 家属发声", "三亚女子被毒蛇咬伤身亡 医院正调查", "《酱园弄》第一部定档", "#娄底拖拽女童的醉酒男该罚多重#", "7人停车场殴打未成年 警方：全部抓获", "周杰伦和山下智久夜游日本", "巴黎世家平角短裤造型裙子已缺货", "70岁林青霞给乐队敬酒一口闷", "彭于晏方发声明 否认与蔡依林恋情", "希腊与大英博物馆文物归还仍有分歧", "全球多国赴美商务出行预定下降", "“马克龙”被偷走了", "新人结婚前一天开车坠河双双遇难", "48岁女歌手突发脑溢血去世", "贾冰自曝曾45天减45斤", "被赵丽颖《酱园弄》出场美晕了", "桂林暴雨致多小区地下车库被淹", "姚明要复出？已恢复训练2个月", "韩出口民调显示李在明将赢得大选", "贾冰成功减肥后睡觉不打呼噜了", "世界泳联晒全红婵陈芋汐完美一跳", "网传黄多多将出演《边城》翠翠一角", "柳州一路面塌方车辆陷其中 官方回应", "胡歌新身份正式官宣", "私家车让行反被救护车司机竖中指", "尹锡悦夫妇罕见公开露面", "钓鱼佬被困河中 男子用无人机吊上岸", "经合组织再次下调全球经济增长预期", "乒超球员名单：张本美和加盟成都队", "卢东亮任山西省代省长", "莫言谈给冯巩起名“闭嘴”原因", "车辆失控 11岁姐姐救回1岁妹妹", "保时捷女销冠5个月已卖超80台", "顺风车乱象调查：乘客被“卖猪仔”", "以军在加沙援助物资点开枪致27死", "小米回应YU7产能是否充足", "韩国大选结果公布后新总统立即履职", "德国驻华大使馆祝贺樊振东", "陈梦坦言渴望有完整家庭"]

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
