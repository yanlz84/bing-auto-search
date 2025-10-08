// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.340
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
var default_search_words = ["中华文化跃动传承之力", "中国最大收费站挤满返程大军", "“出片式旅行” 正毁掉当代人的假期", "中国研究出可弯折20000次柔性电池", "普京：特别军事行动所有目标必须实现", "中国游客马来西亚失联 定位在海里", "特朗普再次暗示将吞并加拿大", "因女友与走失女孩撞脸 男子被误抓", "微信又更新了 撤回消息有大变化", "特斯拉市值一夜蒸发超4600亿元", "詹姆斯的“重大决定”是广告", "3人造谣“新郎因加彩礼跳河”被罚", "今日寒露", "被返程车流震撼到了", "中国人放假 东非大草原都堵车了", "美股三大指数集体收跌 特斯拉跌超4%", "男子为给领导添堵 向境外泄露机密", "面馆休业几天 老板用文言文写请假条", "“告诉王维 西出阳关全是人”", "注意！本周上班时间有变 周六要补班", "厄瓜多尔总统专车遇袭 警方已抓5人", "女子结婚8年才发现喜被里有红枣榄子", "女方悔婚退彩礼时要扣3万拥抱费", "70多匹马被绑一条前腿 主人回应", "你没听错！“歼-16没有短板”", "孙燕姿匿名捐款上千万", "男子通过刷视频定位 偷走份子钱38万", "女方父亲回应悔婚退彩礼扣3万拥抱费", "红白事“狭路相逢” 到底谁让谁", "人人人返程人人人", "主持人曹颖自曝吃了20多年抗焦虑药", "多地发文：招人 只要退休的", "珠峰暴雪 向导一人一狗带上百人撤离", "歌迷狂追“谢霆锋”拍照 安保：假的！", "佟丽娅董璇带娃中秋晒合影", "观众喊新婚快乐 马頔：份子钱交一下", "台网红“馆长”回应被台当局约谈", "诺奖得主捕捉到量子世界“穿墙术”", "南通5比0击败淮安直接晋级4强", "鸡排哥回应大学生卖雪王送他的写真", "俄军试射洲际弹道导弹 画面曝光", "返程注意！小心因一字之差跑错车站", "中国征服“死亡之海”", "简化版Model Y将便宜约10%", "驻冰岛大使馆回应华人乘坐巴士侧翻", "小伙和女友餐厅吃饭被民警戴铐带走", "苏丹宣布夺回法希尔市两处军事重地", "世界第一高桥下的“流量密码”", "美政府停摆致空管无薪 多地航班延误", "冰岛一大巴侧翻 车上一半是中国游客", "美国两年对以军援217亿美元"]

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
