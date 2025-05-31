// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.80
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
var default_search_words = ["创新 创新 再创新", "原县委书记花上千万建10个厕所被查", "汽车价格战再起 20多万的车14万卖", "端午遇上六一带动假日消费热", "特朗普送了马斯克一把白宫金钥匙", "周华健儿子结婚", "给在押人员递烤鸡榴莲 5名律师被罚", "陈楚生提到袁惟仁哭了", "王楚钦自曝上厕所都有固定坑位", "黄多多近照曝光 美貌不输妈妈", "男子遭精神病邻居砸门2年 报警200次", "生酮液断 这些减肥法真的安全吗", "美的总裁：小米做家电在战略上已输", "特朗普称将把进口钢铁关税提高至50%", "最高法：拐卖儿童犯罪呈下降趋势", "特朗普：特斯拉将在美国生产整车", "特朗普马斯克发表“分手感言”", "尊界S800价格公布", "62岁俞敏洪骑行摔倒受伤：犯困睡着了", "欧盟：欧美贸易谈判前景面临不确定性", "断眉《歌手》一开口我的青春回来了", "广西瓜农因收购价低把西瓜扔进池塘", "联合国安理会延长对南苏丹的制裁", "印尼采石场山体滑坡已至13人死亡", "断眉吃粽子好吃但粘牙", "高考倒计时7天", "孙俪唇下痣系因车祸玻璃碴致假性痣", "印度防长登航母表态：并未结束", "多家国际投行上调中国经济增速预期", "《歌手》第三期排名公布 白举纲淘汰", "佛山龙舟赛鼓手神似吴彦祖", "董卿再拿话筒回归舞台", "哈佛校长毕业致辞获30秒热烈鼓掌", "王楚钦回应球拍2次受损", "周霁任香港中联办主任", "成都4000架无人机演绎人类进化史", "#马斯克为什么从特朗普政府离职#", "粪管员逆袭成首届大学生", "国货美妆林清轩将赴港上市", "U16国少2-2越南U16", "小男孩表演节目突然生气“罢工”", "在哈佛毕业礼上演讲的中国女孩是谁", "王毅签署国际调解院公约", "儿童节演出服穿完就退？商家出奇招", "单依纯《歌手》第三期第二", "湖南娄底一水沟水体被染成蓝色", "霹雳-15射程“反向虚标”？专家解读", "郑钦文称自己武汉长大不怕热", "特朗普关税政策暂停又恢复意味什么", "著名物理学家汪承灏逝世", "央视披露印巴空战多段现场视频"]

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
