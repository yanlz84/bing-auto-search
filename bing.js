// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.122
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
var default_search_words = ["续写千年友谊 开辟崭新未来", "伊朗与英法德密谈3小时 声明发布", "一段8分钟录音引发泰国政坛地震", "“三夏”里的新质生产力", "让韦东奕听3天讲座的女教授有多牛", "公园月薪3万招摸鱼官每天工作2小时", "特朗普：很难要求以色列停止空袭伊朗", "GAI还是戴上墨镜唱歌吧", "女子想开蜜雪冰城结果加盟奶爸王子", "小沈阳女儿想成为下一个Jennie", "以色列：必须做好准备与伊朗打持久战", "广州一外卖骑手猝死？谣言", "以色列国防军对伊朗发动新一轮空袭", "外交部回应大陆24小时派出46架战机", "面临罢免的泰国总理佩通坦何去何从", "以军称伊朗发起新一轮导弹袭击", "伊朗导弹再次击中以色列南部城市", "车库被淹女子遭困22小时：手脚发白", "高圆圆带女儿在巴塞罗那吃麻辣烫", "马嘉祺被淘汰了", "程潇穿着清凉和妈妈外出好惬意", "伊朗公布导弹齐射画面", "清华回应女教授被树砸身亡", "伊朗开出谈判条件 特朗普透露底线", "流浪狗暴雨中相拥被好心人收养", "以色列全境响防空警报", "俄称若哈梅内伊遇刺将作出负面反应", "热身赛中国女篮32分大胜日本女篮", "以方期待欧洲对伊立场“坚定”", "特朗普再呼吁降息：也许不解雇鲍威尔", "伊朗外长联合国控诉以色列战争罪", "中方回应留学生在英被判终生监禁", "张子宇9中8砍下16分", "外交部宣布：黄循财将访华", "中国留英博士下药强奸多人被判无期", "美股收盘涨跌不一 谷歌跌近4%", "秦岭失联女子曾被拍到经过草甸崖边", "干部请假半天打麻将赌博被行拘", "美代表尴尬口误：以色列散布恐怖苦难", "泰总理前往边境地区会见军区司令", "美军向中东运送更多血浆", "俄：对伊核打击或酿切尔诺贝利级灾难", "以外长称推迟了伊核武计划至少两年", "联合国秘书长警告以伊冲突可能失控", "普京：俄GDP连续两年增速超4%", "《歌手2025》单依纯守榜失败", "外交部回应台监控大陆“间谍活动”", "普京：俄罗斯愿与中国开展全面合作", "招聘被指萝卜坑 高校确认有亲属关系", "哈佛大学获批暂时继续接受国际学生", "单依纯《歌手》本期爆冷第五名"]

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
