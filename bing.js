// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.188
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
var default_search_words = ["开放新高地 共享新机遇", "6名大学生参观企业身亡 企业致歉", "特朗普：对大部分国家征15%至50%关税", "海南全岛封关意味着什么", "福耀科技大学首期本科50人集结完毕", "男星杀害女友被枪决 家人已搬离村子", "超越泡泡玛特 潮玩界新黑马啥来头", "母亲称14岁儿子在境外被多次转卖", "霸王茶姬回应六安拼音写成Liù ān", "广东基孔肯雅热确诊已超3000例", "年轻人终究是被丑鞋“夺舍”了", "宜昌一游船倒扣30人坠江？谣言", "36岁博士生偷税1200多万获刑5年", "全网羡慕的气血感 是新的身材焦虑吗", "女孩去广西后失联 最后定位柬埔寨", "“本升专”的年轻人 比想象中清醒", "学生溺亡涉事矿企本月曾开安全会", "科研人员违规使用AI致泄密", "乌释放停火信号 俄希望接着谈", "男子骑摩托追尾后一脸撞上榴莲", "汪峰299元的音乐课为啥卖不动", "特朗普称和爱泼斯坦的画面是假新闻", "AI眼镜市场迎来爆发式增长", "上海交通委介入错付车费后轻生案", "这些工作“转正”了", "暴雨黄色预警：北京东北部局地大暴雨", "谁在为红色“尖叫”饮料的溢价买单", "美国将迎来“史上最贵汉堡包”", "官方通报列车商务座椅卫生脏乱", "95后土木研究生卖烧饼涨粉10万", "自述在马尔代夫遭性侵女子发声", "马景涛前妻带俩儿子去韩国", "T1向Zeus正式道歉", "店员被顾客责骂 围观女生买花安慰", "在宿舍泡牛奶被通报？学校回应", "评论员：康养项目爆雷事件危害深重", "美军发问被嘲到删帖", "特斯拉高速上连续5次别停后车", "第8号台风“竹节草”生成", "俄最大攻击无人机工厂曝光", "小伙救起一家三口后不幸溺亡", "女排世联赛 中国2-3惜败波兰无缘4强", "奥特曼：AI三大风险让我夜不能寐", "“第六次中东战争”改变了什么", "厦门一公司检测报告造假被通报", "特朗普跟马科斯说和中国关系很好", "欧文：不允许任何人贬低科比", "美媒披露爱泼斯坦案更劲爆细节", "加沙记者在饥饿中坚持报道", "公安部：3亿多人申领电子驾照", "孙燕姿敷着面膜开启47岁"]

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
