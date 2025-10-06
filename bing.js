// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.336
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
var default_search_words = ["家和万事兴", "男孩跪地拦车救母感动全网 妈妈回应", "武契奇暗示可能爆发新的战争", "超大满月中秋登场", "国庆假期大国重器捷报频传", "中秋节快乐", "网警提醒：假期过半安全不松懈", "小孩哥用通缉令上证件号认证游戏", "迪丽热巴嫦娥造型像神女下凡", "山西婚礼要在下水道井盖贴喜字", "中国人研究月球土特产又有新成果", "“台风把鲸鱼吹上岸”系谣言", "歼-10CE为何一战成名？总师首次披露", "男子体内抽出牛奶血 这样吃饭危害大", "司机追尾后昏迷 10岁儿子跪车旁求助", "中秋赏月地图出炉：哪里能看皓月当空", "伊朗货币面值将“去掉四个零”", "老戏骨集体景区再“上岗”", "女游客拍照落水 小伙下水救人", "小男孩独自在高速上奔跑 原因离谱", "双预警齐发 多地将有暴雨大暴雨", "现货黄金突破3900美元关口 再创新高", "这个假期仿佛“捅了台风窝”", "上铺跌落砸伤女孩男子称正筹钱", "印尼学校倒塌事故遇难人数升至53人", "市民台风天坚持办席 饭菜撒一地", "“环保少女”被曝在狱中遭以军虐待", "核电站竟然还有产珍珠的副业", "美战争部长带3068人做俯卧撑创纪录", "县住建局局长彭金明被政务撤职", "年轻人各种“野生”睡姿等日出", "以色列否认虐待“环保少女”", "被高喊退票 景区让游客去别处玩", "金正恩登上“崔贤”号驱逐舰", "麦德姆登陆广西 吹断树木吹碎玻璃", "越南女富豪被捕 曾撒钱踩“钞票路”", "台风麦德姆凌晨二次登陆广西", "八国联合声明：呼吁立即结束加沙战争", "美军吵架：内讧加剧还是实力焦虑", "5两的大闸蟹捆了1两的绳子", "林志玲月下华尔兹双人舞台", "内塔尼亚胡“开出条件”", "特朗普不满内塔尼亚胡消极反应", "中秋遇国庆 祝愿家国共团圆", "伊朗计划与中国合作引入北斗系统", "智能表测睡眠是否真靠谱", "王曼昱回应4比2孙颖莎", "哥伦比亚陆军基地遭袭 8名士兵受伤", "特朗普称美军再次击中运毒船", "台湾长荣航空一天内发生两起意外", "男子查出肾结石未重视拖成大麻烦"]

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
