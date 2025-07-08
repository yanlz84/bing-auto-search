// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.157
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
var default_search_words = ["习近平为何来到这座太行山城", "扛140斤硬币存银行遭拒 当事人发声", "国防部回应歼-10战机出口问题", "暑期文旅消费火热开启", "女子坐11小时飞机后心跳骤停去世", "4.9分外卖店用草酸洗虾多日不换水", "中方回应外国船只挂五星红旗防袭击", "自来水黄得像酱油 水务部门：没问题", "向佐金发配蕾丝透视装亮相巴黎", "苏州法院发悬赏公告：赏金最高2600万", "#外卖小哥讲述被迫卷入补贴大战#", "通辽一楼盘全部坍塌？官方辟谣", "大学女生和男友双双坠亡 警方通报", "非法收受财物超2.7亿 王勇被判死缓", "中方回应特朗普将对14国加征关税", "湖北省委：坚决拥护党中央决定", "《以法之名》原型揭秘：太子奶李途纯案", "印度自称是“世界最平等国家之一”", "西藏口岸发生泥石流 已致17人失联", "孙菲菲称当年澄清是应王阳要求写的", "曝短剧顶流孙樾带神秘女子回家", "中国最北的北极村都装空调了", "巴军队高层否认冲突时中国积极支持", "飞机着陆前粉丝强闯机舱追星", "蜜雪冰城用脚关水桶员工道歉", "国乒男单4人出局", "蜜雪员工用脚关桶或引起法律争议", "特朗普对日韩等14国加税 最高40%", "周治平任中国兵器工业集团董事长", "演员李诗英称怀上和前夫的二胎", "周先旺被查 曾任武汉市市长", "向佐像偷穿郭碧婷高跟鞋10年了", "鹿晗关晓彤“同城零互动”", "日韩等国回应特朗普发关税函", "二十大以来31个省区打虎“全覆盖”", "日本去世女星童年曾遭母亲虐待", "iOS26 Beta3发布完善 “液态玻璃”", "官方终于出手整治单踏板了", "特朗普发关税函为何漏了个“大头”", "山东舰离开香港 震撼一幕刷屏", "特朗普：希望适时取消对伊朗制裁", "起猛了 音乐节能登记结婚了", "白宫发言人：洪灾是天意 政府没错", "孙菲菲发文否认蹭王阳流量", "17年来首次 马克龙对英进行国事访问", "浙江发布山洪红色预警", "杨紫李现合跳《难生恨》手势舞", "沪指要站上3500点 这次真的不难", "摆摊五星级酒店经理：面子不值钱", "“新长安集团” 预计将于8月落地", "以军在加沙重大损失 近20名士兵伤亡"]

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
