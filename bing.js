// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.269
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
var default_search_words = ["正义必胜 和平必胜 人民必胜", "我们的飞机再也不用飞第二遍", "中国对俄罗斯试行免签", "九三阅兵总体设计呈现哪些特点", "中俄元首餐桌叙谊 普京品茶吃水果", "她是新中国第一位女将军", "公安部公布3起打击“黑飞”案例", "预约：九三阅兵直播", "“体育外卖”需求暴涨", "九三阅兵将实现多个“首次”", "赴美旅游凉了？这些原因劝退游客", "厦门交警辟谣翔安隧道海水倒灌", "九三阅兵超全观看指南", "人去世了朋友圈会消失？微信回应", "中方回应是否有外国军队参加阅兵", "委总统秀中国手机：美国佬窃听不了", "外交部回应乌克兰涉普京访华言论", "黑河小学迎来大批俄罗斯萌娃", "苑举正哽咽：想告诉爸爸中国强了", "旺旺总经理和中天小姐姐在京汇合", "中年男人的“一代神车”消失了", "上合天津峰会22米巨幅壁画火出圈", "微信聊天能发live图了", "8万只气球与8万羽和平鸽将同时腾空", "阅兵队列整齐得像复制粘贴 有何秘诀", "金正恩乘专列来华 现场画面公布", "洪秀柱已抵京 将出席九三阅兵", "不会PPT的优先 武汉一硕导招生帖走红", "揭开731少年班罪恶真相", "法国小伙马库斯在京分享会座无虚席", "深圳一校长升旗仪式上连做71个俯卧撑", "阿富汗东部地震已造成千人遇难", "军人退役当天向相恋8年女友成功求婚", "儿童指纹水杯是真靠谱还是智商税", "全球最大冰山面积减少超三分之一", "阅兵观礼服务包：3种颜色12件物品", "埃文凯尔：捐二战相册是正确决定", "俄媒发布视频：普京在天津的一天", "为何女生身体更容易出现淤青", "驴友爬大同殿山发现疑似佛磬老物件", "尼泊尔总理奥利抵京", "面馆老板凌晨4点做面 晚上踢汉超", "韩国国会议长禹元植抵京", "济南一奶茶店小票印霸总小说", "宇树科技：将在四季度递交上市申请", "天安门广场核心区最新航拍", "美国劳动力市场流失逾120万移民", "蒯曼有了新称号：五局女王", "年轻人正在“断舍离”信用卡", "“吃沙”小伙带动4万人次来家乡种树", "学校回应午休室住近百人：二孩入学潮"]

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
